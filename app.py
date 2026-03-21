#!/usr/bin/env python3
"""Интерактивный калькулятор: два числа и выбранная операция."""

OPERATIONS = {
    "1": ("+", lambda a, b: a + b),
    "2": ("-", lambda a, b: a - b),
    "3": ("*", lambda a, b: a * b),
    "4": ("/", lambda a, b: a / b if b != 0 else None),
    "5": ("**", lambda a, b: a**b),
    "6": ("%", lambda a, b: a % b if b != 0 else None),
}


def read_float(prompt: str) -> float:
    while True:
        raw = input(prompt).strip().replace(",", ".")
        try:
            return float(raw)
        except ValueError:
            print("Введите корректное число.")


def main() -> None:
    print("Калькулятор: введите два числа и выберите действие.")
    a = read_float("Первое число: ")
    b = read_float("Второе число: ")

    print("\nДействие:")
    print("  1 — сложение (+)")
    print("  2 — вычитание (-)")
    print("  3 — умножение (*)")
    print("  4 — деление (/)")
    print("  5 — возведение в степень (**)")
    print("  6 — остаток от деления (%)")

    while True:
        choice = input("Номер действия (1–6): ").strip()
        if choice in OPERATIONS:
            break
        print("Выберите число от 1 до 6.")

    symbol, fn = OPERATIONS[choice]
    result = fn(a, b)

    if result is None:
        print("Ошибка: деление на ноль невозможно.")
    else:
        print(f"\nРезультат: {a} {symbol} {b} = {result}")


if __name__ == "__main__":
    main()
