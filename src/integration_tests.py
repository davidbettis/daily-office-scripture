#!/usr/local/bin/python3
# -*- coding: utf-8 -*-

import logging
import unittest
import pprint
import json
from lambda_function import lambda_handler

class TestDailyOffice(unittest.TestCase):

    def test_morning(self):
        self.maxDiff = None
        output = lambda_handler({
            'requestContext': {'stage': 'test'},
            'queryStringParameters': {'date': '2019-03-01', 'office': 'morning'}
            }, None)


        self.assertEqual(output['statusCode'], 200)
        self.assertEqual(output['headers']['Access-Control-Allow-Origin'], 'http://localhost:3000')
        self.assertEqual(output['isBase64Encoded'], False)

        parsed = json.loads(output['body'])

        self.assertEqual(parsed['morning-references'], ['Exod 8', 'Matt 13:1-23'])

        # Check the texts
        self.assertEqual(len(parsed['morning']), 2)
        ot = parsed['morning'][0]
        nt = parsed['morning'][1]
        self.assertEqual(ot.startswith('[1] Then the LORD said to Moses'), True)
        self.assertEqual(nt.startswith('[1] That same day Jesus went out of the house'), True)

        self.assertEqual(len(parsed['morning-with-verses']), 2)
        ot_verses = parsed['morning-with-verses'][0]
        nt_verses = parsed['morning-with-verses'][1]
        self.assertEqual(ot_verses[0]['verse'], '1')
        self.assertEqual(ot_verses[0]['text'][0].startswith('Then the LORD said to Moses'), True)
        self.assertEqual(nt_verses[0]['verse'], '1')
        self.assertEqual(nt_verses[0]['text'][0].startswith('That same day Jesus went out of the house'), True)

        # Check the first verse of the psalm
        self.assertEqual(len(parsed['morning-psalms']), 1)
        first_psalm = parsed['morning-psalms'][0]
        self.assertEqual(first_psalm['psalm_section'], '146')
        self.assertEqual(first_psalm['psalm_text'].startswith('[1] Praise the LORD!'), True)
        self.assertEqual(first_psalm['psalm_verses'][0]['verse'], '1')
        self.assertEqual(first_psalm['psalm_verses'][0]['text'][0].startswith('Praise the LORD!'), True)

    def test_evening(self):
        self.maxDiff = None
        output = lambda_handler({
            'requestContext': {'stage':'test'},
            'queryStringParameters': {'date': '2019-03-04', 'office': 'evening'}
            }, None)

        self.assertEqual(output['statusCode'], 200)
        self.assertEqual(output['headers']['Access-Control-Allow-Origin'], 'http://localhost:3000')
        self.assertEqual(output['isBase64Encoded'], False)

        parsed = json.loads(output['body'])

        self.assertEqual(parsed['evening-references'], ['Prov 3 † 1-27', 'Rom 16'])

        # Check the texts
        self.assertEqual(len(parsed['evening']), 2)
        ot = parsed['evening'][0]
        nt = parsed['evening'][1]
        self.assertEqual(ot.startswith('[1] My son, do not forget my teaching'), True)
        self.assertEqual(nt.startswith('[1] I commend to you our sister Phoebe'), True)

        self.assertEqual(len(parsed['evening-with-verses']), 2)
        ot_verses = parsed['evening-with-verses'][0]
        nt_verses = parsed['evening-with-verses'][1]
        self.assertEqual(ot_verses[0]['verse'], '1')
        self.assertEqual(ot_verses[0]['text'][0].startswith('My son, do not forget my teaching'), True)
        self.assertEqual(nt_verses[0]['verse'], '1')
        self.assertEqual(nt_verses[0]['text'][0].startswith('I commend to you our sister Phoebe'), True)

        # Check the first verse of the psalm
        self.assertEqual(len(parsed['evening-psalms']), 1)
        first_psalm = parsed['evening-psalms'][0]
        self.assertEqual(first_psalm['psalm_section'], '7')
        self.assertEqual(first_psalm['psalm_text'].startswith('A Shiggaion of David'), True)
        self.assertEqual(first_psalm['psalm_verses'][0]['verse'], '1')
        self.assertEqual(first_psalm['psalm_verses'][0]['text'][0].startswith('O LORD my God, in you do I take refuge'), True)

    def test_apocrypha(self):
        output = lambda_handler({
            'requestContext': {'stage':'test'},
            'queryStringParameters': {'date': '2019-07-04', 'office': 'evening'}
            }, None)

        self.assertEqual(output['statusCode'], 200)
        self.assertEqual(output['headers']['Access-Control-Allow-Origin'], 'http://localhost:3000')
        self.assertEqual(output['isBase64Encoded'], False)

        parsed = json.loads(output['body'])

        self.assertEqual(parsed['evening-references'], ['Susanna', 'Acts 26'])

        # Check the texts
        self.assertEqual(len(parsed['evening']), 2)
        ot = parsed['evening'][0]
        nt = parsed['evening'][1]

        self.assertEqual(ot.startswith('There was a man living in Babylon whose name was Joakim.'), True)
        self.assertEqual(nt.startswith('[1] So Agrippa said to Paul, “You have permission to speak for yourself.”'), True)

        # Check the first verse of the psalm
        self.assertEqual(len(parsed['evening-psalms']), 1)
        first_psalm = parsed['evening-psalms'][0]
        self.assertEqual(first_psalm['psalm_section'], '10')
        self.assertEqual(first_psalm['psalm_text'].startswith('[1] Why, O LORD, do you stand far away?'), True)
        self.assertEqual(first_psalm['psalm_verses'][0]['verse'], '1')
        self.assertEqual(first_psalm['psalm_verses'][0]['text'][0].startswith('Why, O LORD, do you stand far away?'), True)


    def test_spanned_chapters(self):
        output = lambda_handler({
            'requestContext': {'stage':'test'},
            'queryStringParameters': {'date': '2021-12-26', 'office': 'morning'}
            }, None)

        self.assertEqual(output['statusCode'], 200)
        self.assertEqual(output['headers']['Access-Control-Allow-Origin'], 'http://localhost:3000')
        self.assertEqual(output['isBase64Encoded'], False)

        parsed = json.loads(output['body'])

        self.assertEqual(parsed['morning-references'], ['Acts 6:8—end; Acts 7:1-6; Acts 7:44-60', 'Rev 18'])

        self.assertEqual(len(parsed['morning']), 2)
        first = parsed['morning'][0]

        self.assertEqual('[8] And Stephen, full of grace and power' in first, True)
        self.assertEqual('[1] And the high priest said' in first, True)
        self.assertEqual('[44] “Our fathers had the tent of witness in the wilderness,' in first, True)
        

unittest.main()
