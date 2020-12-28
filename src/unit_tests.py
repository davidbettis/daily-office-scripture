#!/usr/local/bin/python3
# -*- coding: utf-8 -*-

import logging
import unittest
from lambda_function import splitByVerse
from lambda_function import is_apocrypha
from lambda_function import get_apocrypha_text

class TestApocryphaText(unittest.TestCase):
    def test_whole_book(self):
        text = get_apocrypha_text('Susanna')
        self.assertTrue(text.startswith('There was a man living'))

    def test_chapter(self):
        text = get_apocrypha_text('Wisdom 2')
        self.assertTrue(text.startswith('For they reasoned unsoundly'))

    def test_chapter_three_pieces(self):
        text = get_apocrypha_text('1 Macc 7')
        self.assertTrue(text.startswith('In the one hundred fifty-first'))

    def test_dne_book(self):
        self.assertEqual(get_apocrypha_text('dne 1'), None)
        self.assertEqual(get_apocrypha_text('1 dne 10'), None)
        self.assertEqual(get_apocrypha_text('dne'), None)
        self.assertEqual(get_apocrypha_text('dne dne dne dne'), None)

    def test_dne_verse(self):
        self.assertEqual(get_apocrypha_text('wisdom 99'), None)
        self.assertEqual(get_apocrypha_text('1 macc 9999'), None)

class TestIsApocrypha(unittest.TestCase):
    def test_present(self):
        self.assertTrue(is_apocrypha('Baruch'))
        self.assertTrue(is_apocrypha('barUCH'))
        self.assertTrue(is_apocrypha('1 macC'))
        self.assertTrue(is_apocrypha('2 Macc'))
        self.assertTrue(is_apocrypha('wisdom'))
        self.assertTrue(is_apocrypha('judith'))
        self.assertTrue(is_apocrypha('Ecclesiasticus'))
        self.assertTrue(is_apocrypha('Susanna'))

    def test_not_present(self):
        self.assertFalse(is_apocrypha('3 Macc'))
        self.assertFalse(is_apocrypha('Ecclesiastes'))
        self.assertFalse(is_apocrypha('Matthew'))

class TestVerseParsing(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(splitByVerse("[1] foo [2] bar"), [{'verse': '1', 'text': ['foo']}, {'verse': '2', 'text': ['bar']}])

    def test_extra_padding(self):
        self.assertEqual(splitByVerse("[1] foo       [2] bar"), [{'verse': '1', 'text': ['foo']}, {'verse': '2', 'text': ['bar']}])

    def test_newlines(self):
        self.assertEqual(splitByVerse("[1] foo\nbar\nbaz"), [{'verse': '1', 'text': ['foo', 'bar', 'baz']}])

    def test_empty(self):
        self.assertEqual(splitByVerse(" [1] [2] foo"), [{'verse': '1', 'text': ['']}, {'verse': '2', 'text': ['foo']}])

    def test_unparsable(self):
        self.assertEqual(splitByVerse("foo bar baz"), [])

unittest.main()
