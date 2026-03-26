#!/usr/bin/env python3
"""Unit тесты для калькулятора."""

import unittest
from unittest.mock import patch
from io import StringIO
import sys

from app import OPERATIONS, read_float


class TestOperations(unittest.TestCase):
    """Тесты для математических операций."""

    def test_addition(self):
        """Тест сложения."""
        symbol, fn = OPERATIONS["1"]
        self.assertEqual(symbol, "+")
        self.assertEqual(fn(2, 3), 5)
        self.assertEqual(fn(-1, 1), 0)
        self.assertEqual(fn(0, 0), 0)

    def test_subtraction(self):
        """Тест вычитания."""
        symbol, fn = OPERATIONS["2"]
        self.assertEqual(symbol, "-")
        self.assertEqual(fn(5, 3), 2)
        self.assertEqual(fn(3, 5), -2)
        self.assertEqual(fn(0, 0), 0)

    def test_multiplication(self):
        """Тест умножения."""
        symbol, fn = OPERATIONS["3"]
        self.assertEqual(symbol, "*")
        self.assertEqual(fn(4, 5), 20)
        self.assertEqual(fn(-2, 3), -6)
        self.assertEqual(fn(0, 100), 0)

    def test_division_normal(self):
        """Тест обычного деления."""
        symbol, fn = OPERATIONS["4"]
        self.assertEqual(symbol, "/")
        self.assertEqual(fn(10, 2), 5)
        self.assertEqual(fn(7, 2), 3.5)
        self.assertEqual(fn(-10, 2), -5)

    def test_division_by_zero(self):
        """Тест деления на ноль."""
        symbol, fn = OPERATIONS["4"]
        self.assertIsNone(fn(10, 0))
        self.assertIsNone(fn(0, 0))
        self.assertIsNone(fn(-5, 0))

    def test_power(self):
        """Тест возведения в степень."""
        symbol, fn = OPERATIONS["5"]
        self.assertEqual(symbol, "**")
        self.assertEqual(fn(2, 3), 8)
        self.assertEqual(fn(5, 0), 1)
        self.assertEqual(fn(2, -1), 0.5)
        self.assertEqual(fn(0, 5), 0)

    def test_modulus_normal(self):
        """Тест остатка от деления."""
        symbol, fn = OPERATIONS["6"]
        self.assertEqual(symbol, "%")
        self.assertEqual(fn(10, 3), 1)
        self.assertEqual(fn(15, 5), 0)
        self.assertEqual(fn(7, 4), 3)

    def test_modulus_by_zero(self):
        """Тест остатка от деления на ноль."""
        symbol, fn = OPERATIONS["6"]
        self.assertIsNone(fn(10, 0))
        self.assertIsNone(fn(0, 0))


class TestReadFloat(unittest.TestCase):
    """Тесты для функции чтения числа."""

    def test_read_float_with_dot(self):
        """Тест чтения числа с точкой."""
        with patch('sys.stdout', new_callable=StringIO):
            with patch('builtins.input', side_effect=["3.14"]):
                result = read_float("Введите число: ")
                self.assertEqual(result, 3.14)

    def test_read_float_with_comma(self):
        """Тест чтения числа с запятой (заменяется на точку)."""
        with patch('sys.stdout', new_callable=StringIO):
            with patch('builtins.input', side_effect=["3,14"]):
                result = read_float("Введите число: ")
                self.assertEqual(result, 3.14)

    def test_read_float_integer(self):
        """Тест чтения целого числа."""
        with patch('sys.stdout', new_callable=StringIO):
            with patch('builtins.input', side_effect=["42"]):
                result = read_float("Введите число: ")
                self.assertEqual(result, 42.0)

    def test_read_float_negative(self):
        """Тест чтения отрицательного числа."""
        with patch('sys.stdout', new_callable=StringIO):
            with patch('builtins.input', side_effect=["-5.5"]):
                result = read_float("Введите число: ")
                self.assertEqual(result, -5.5)

    def test_read_float_retry_on_invalid(self):
        """Тест повторного ввода при некорректном значении."""
        with patch('sys.stdout', new_callable=StringIO):
            with patch('builtins.input', side_effect=["abc", "4.5"]):
                result = read_float("Введите число: ")
                self.assertEqual(result, 4.5)

    def test_read_float_whitespace(self):
        """Тест чтения числа с пробелами."""
        with patch('sys.stdout', new_callable=StringIO):
            with patch('builtins.input', side_effect=["  3.14  "]):
                result = read_float("Введите число: ")
                self.assertEqual(result, 3.14)


class TestOperationsDict(unittest.TestCase):
    """Тесты структуры OPERATIONS."""

    def test_all_operations_present(self):
        """Тест наличия всех операций."""
        expected_keys = {"1", "2", "3", "4", "5", "6"}
        self.assertEqual(set(OPERATIONS.keys()), expected_keys)

    def test_operations_return_tuple(self):
        """Тест что каждая операция возвращает кортеж."""
        for key, value in OPERATIONS.items():
            self.assertIsInstance(value, tuple)
            self.assertEqual(len(value), 2)
            self.assertIsInstance(value[0], str)
            self.assertTrue(callable(value[1]))


if __name__ == "__main__":
    unittest.main()
