#!/usr/local/bin/python3
# -*- coding: utf-8 -*-

import credentials
import json
import logging
import pprint
import re
import requests
import sys

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

API_URL = 'https://api.esv.org/v3/passage/text/'

JSON_DIR = "./data/"

# Query the ESV API to retrieve the passage.
#
# Parameters:
#   passage, fuzzy string describing the passage, e.g. Ps+23, "Psalm 23"
def get_esv_text(passage):
    params = {
        'q': passage,
        'include-headings': False,
        'include-footnotes': False,
        'include-verse-numbers': True,
        'include-short-copyright': False,
        'include-passage-references': False
    }
    headers = {
        'Authorization': 'Token %s' % credentials.API_KEY
    }

    response = requests.get(API_URL, params=params, headers=headers)
    passages = response.json()['passages']
    return passages[0].strip() if passages else 'Error: Passage not found'

# Note, not all the apocrypha books, but the ones that are in the ACNA Daily Office.
APOCRYPHA_BOOKS = [
    'Baruch',
    'Wisdom',
    'Judith',
    'Susanna',
    '1 Macc',
    '2 Macc',
    'Ecclesiasticus'
]

# Query the local JSON file to retrieve the apocrypha texts.
#
# Parameters:
#   passage, string describing the passage including the book name and a chapter, e.g. "Susanna", "1 Macc 1"
#   NOTE: does not support verses or verse ranges
def get_apocrypha_text(passage):
    # Eliminate duplicate spaces and trim leading/trailing whitespace
    passage = ' '.join(passage.split()).strip().lower()

    # Extract the book and the chapter number
    pieces = passage.split(' ')
    num_pieces = len(pieces)

    book = None
    chapter = None
    if num_pieces == 1:
        book = pieces[0]
    elif num_pieces == 2:
        book = pieces[0]
        chapter = pieces[1]
    elif num_pieces == 3:
        book = pieces[0] + ' ' + pieces[1]
        chapter = pieces[2]
    else:
        LOGGER.info('Could not parse apocrypha passage: \'' + passage + '\'')
        return None
    
    with open(JSON_DIR + 'apocrypha.json', 'r') as json_file:
        data = json.load(json_file)
        if chapter is None:
            if book in data:
                return data[book]
        else:
            if (book in data) and (chapter in data[book]):
                return data[book][chapter]
    return None

# Is the reference part of the apocrypha?
def is_apocrypha(ref):
    ref = ref.lower()
    for book in APOCRYPHA_BOOKS:
        if ref.startswith(book.lower()):
            return True
    return False

# Split a 'str' that has verses formatted in square brackets into the logical representation with verses as keys in a hash.
#
# Example:
#   Input: str="[1] foo [2] bar [3] baz"
#   Output: [{verse: 1, text: "foo"}, {verse: 2, text: "bar"}, {verse: 3, text: "baz"}]
#
# Parameters:
#   str, the string to split
def splitByVerse(str):
    pairs = []

    i = 0
    scanningNumber = False
    scanningText = False

    substringNumber = ""
    substringText = ""
    while i < len(str):
        c = str[i]

        if c == '[':
            # End of the previous fragment
            if substringText != "":
                pairs.append({'verse': substringNumber.strip(), 'text': substringText.strip().split('\n')})
            # ... and start of a new string.
            substringNumber = ""
            substringText = ""
            scanningNumber = True
            scanningText = False
        elif c == ']':
            scanningNumber = False
            scanningText = True
        else:
            if scanningNumber:
                substringNumber += c
            if scanningText:
                substringText += c
        i = i + 1


    if substringText != "":
        pairs.append({'verse': substringNumber.strip(), 'text': substringText.strip().split('\n')})

    return pairs

# Get texts for the lectionary entry on the provided month and day
#
# Parameters:
#   lectionary, a hash of month -> day -> [array of scripture references of size 2]
#   month, the month to query (e.g. 1 for January)
#   day, the day to query (e.g. 30 for the 30th day of the month)
def get_lesson_texts(lectionary, month, day):
    texts = []
    for ref in lectionary[month][day]:
        full_ref = re.sub('†.*$', '', ref)
        if (is_apocrypha(full_ref)):
            texts.append(get_apocrypha_text(full_ref))
        else:
            texts.append(get_esv_text(full_ref))
    return texts

# Get texts for the psalms lectionary entry on the provided month and day
#
# Parameters:
#   lectionary, a hash of month -> day -> [ array of psalm references ]
#   month, the month to query (e.g. 1 for January)
#   day, the day to query (e.g. 30 for the 30th day of the month)
def get_psalm_texts(lectionary, month, day):
    texts = []
    psalms = lectionary[month][day]
    for psalm_chapter in psalms:
        full_ref = 'Psalm+' + psalm_chapter
        full_text = get_esv_text(full_ref)
        verses = splitByVerse(full_text)
        texts.append({'psalm_section': psalm_chapter, 'psalm_text': full_text, 'psalm_verses': verses})
    return texts


# Main hook for where Lambda gets run. event is the input to the function
#
# Parameters:
#   event.queryStringParameters.date date to get scripture in ISO format, e.g. 2019-03-01
#   event.queryStringParameters.office the office to retrieve. must be 'morning' or 'evening'
def lambda_handler(event, context):

    params = event['queryStringParameters']
    
    # Event input validation
    
    # Get the date
    try:
        date = params['date']
        if not re.match(r'^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]', date):
            return {'statusCode': 400}
    except KeyError as e:
        return {'statusCode': 400}

    # Get the office type (morning/evening)
    try:
        office = params['office']
    except KeyError as e:
        return {'statusCode': 400}

    # Extract year/month/day
    pieces = date.split("-")
    year = str(int(pieces[0]))
    month = str(int(pieces[1]))
    day = str(int(pieces[2]))
    
    # Construct the output
    body = {}

    # Add the full texts
    if office == 'morning':
        with open(JSON_DIR + 'morning-lectionary.json') as f:
            morning_lectionary = json.load(f)
            body['morning'] = get_lesson_texts(morning_lectionary, month, day)
            body['morning-references'] = morning_lectionary[month][day]
        with open(JSON_DIR + 'psalms-morning-lectionary.json') as f:
            body['morning-psalms'] = get_psalm_texts(json.load(f), month, day)
    elif office == 'evening':
        with open(JSON_DIR + 'evening-lectionary.json') as f:
            evening_lectionary = json.load(f)
            body['evening'] = get_lesson_texts(evening_lectionary, month, day)
            body['evening-references'] = evening_lectionary[month][day]
        with open(JSON_DIR + 'psalms-evening-lectionary.json') as f:
            body['evening-psalms'] = get_psalm_texts(json.load(f), month, day)
    else:
        LOGGER.info('Unknown office type: ' + office)
        return {'statusCode': 404}

    # TODO cache these on disk
    # TODO cache these on Elasticache

    # Restrict CORS
    headers = {}
    if event['requestContext']['stage'] == 'test':
      headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    else:
      headers['Access-Control-Allow-Origin'] = 'https://davidbettis.com'

    return {
        'statusCode': 200,
        'body': json.dumps(body),
        'headers': headers,
        'isBase64Encoded': False
    }

