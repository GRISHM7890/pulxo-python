export const PRACTICE_TOPICS = [
    'B1: Basics',
    'B2: Conditionals',
    'B3: Loops',
    'B4: Strings',
    'B5: Lists',
    'B6: Functions',
    'B7: File Handling',
    'B8: OOP',
    'B9: APIs & JSON',
    'B10: AI & ML Basics',
    'S1: SQL Basics',
    'S2: SQL Aggregates',
    'S3: SQL Joins'
];

export const PROBLEMS = {
    'B1: Basics': [
        {
            id: 'v1',
            title: 'Simple Calculator',
            difficulty: 'Easy',
            description: 'Read two integers `a` and `b`. Print their sum, difference, product, and quotient (integer division) each on a new line.',
            input_example: '15\n5',
            output_example: '20\n10\n75\n3',
            constraints: 'Use +, -, *, // operators.',
            test_cases: [
                { input: '15\n5', expected: '20\n10\n75\n3' },
                { input: '10\n3', expected: '13\n7\n30\n3' }
            ],
            starter_code: 'a = int(input())\nb = int(input())\n# Print results below\n',
            tutorial: [
                { step: 1, title: 'Input Collection', detail: 'Read both integers using `int(input())`.', code: 'a = int(input())\nb = int(input())' },
                { step: 2, title: 'Calculations', detail: 'Perform the four operations. For integer division, use `//`.', code: 'print(a + b)\nprint(a - b)\nprint(a * b)\nprint(a // b)' }
            ]
        },
        {
            id: 'v2',
            title: 'Variable Swap',
            difficulty: 'Easy',
            description: 'Read two variables `x` and `y`. Swap their values and print them separated by a space.',
            input_example: '10\n20',
            output_example: '20 10',
            constraints: 'Try to do it without a third variable for full marks!',
            test_cases: [
                { input: '10\n20', expected: '20 10' },
                { input: '5\n15', expected: '15 5' }
            ],
            starter_code: 'x = int(input())\ny = int(input())\n# Swap logic here\nprint(x, y)\n',
            tutorial: [
                { step: 1, title: 'High-Precision Swap', detail: 'In Python, use tuple unpacking for a one-line swap.', code: 'x, y = y, x' }
            ]
        },
        {
            id: 'v3',
            title: 'Largest of 3',
            difficulty: 'Easy',
            description: 'Read three integers and print the largest one.',
            input_example: '10\n25\n15',
            output_example: '25',
            constraints: 'Use the max() function or if-statements.',
            test_cases: [
                { input: '10\n25\n15', expected: '25' },
                { input: '100\n50\n75', expected: '100' }
            ],
            starter_code: 'a = int(input())\nb = int(input())\nc = int(input())\n# Your logic here\n'
        }
    ],
    'B2: Conditionals': [
        {
            id: 'c1',
            title: 'Even or Odd',
            difficulty: 'Easy',
            description: 'Take an integer `n` and print "Even" or "Odd".',
            input_example: '4',
            output_example: 'Even',
            constraints: 'None',
            test_cases: [
                { input: '4', expected: 'Even' },
                { input: '7', expected: 'Odd' }
            ],
            starter_code: 'n = int(input())\n# Your code here\n',
            tutorial: [
                { step: 1, title: 'Modulo Operator', detail: 'Use `%` to find the remainder. `n % 2 == 0` means it\'s even.', code: 'if n % 2 == 0:' }
            ]
        },
        {
            id: 'c2',
            title: 'Grade Calculator',
            difficulty: 'Easy',
            description: 'Read a score (0-100). Print "A" (90+), "B" (80-89), "C" (70-79), or "F" (<70).',
            input_example: '85',
            output_example: 'B',
            constraints: 'None',
            test_cases: [
                { input: '95', expected: 'A' },
                { input: '82', expected: 'B' },
                { input: '72', expected: 'C' },
                { input: '45', expected: 'F' }
            ],
            starter_code: 'score = int(input())\n# Your code here\n'
        },
        {
            id: 'c3',
            title: 'Leap Year',
            difficulty: 'Medium',
            description: 'A year is a leap year if it is divisible by 4, except for century years which must be divisible by 400.',
            input_example: '2000',
            output_example: 'Leap Year',
            constraints: 'Print "Leap Year" or "Common Year".',
            test_cases: [
                { input: '2000', expected: 'Leap Year' },
                { input: '1900', expected: 'Common Year' }
            ],
            starter_code: 'year = int(input())\n# Your logic here\n'
        },
        {
            id: 'c4',
            title: 'Vowel or Consonant',
            difficulty: 'Easy',
            description: 'Read a single character and print if it is a "Vowel" or "Consonant".',
            input_example: 'a',
            output_example: 'Vowel',
            constraints: 'Input is a single character.',
            test_cases: [
                { input: 'a', expected: 'Vowel' },
                { input: 'z', expected: 'Consonant' }
            ],
            starter_code: 'ch = input().lower()\n# Your code here\n'
        }
    ],
    'B3: Loops': [
        {
            id: 'l1',
            title: 'Factorial',
            difficulty: 'Easy',
            description: 'Calculate the factorial of `n`.',
            input_example: '5',
            output_example: '120',
            constraints: 'n >= 0',
            test_cases: [
                { input: '5', expected: '120' },
                { input: '0', expected: '1' }
            ],
            starter_code: 'n = int(input())\n# Your loop here\n'
        },
        {
            id: 'l2',
            title: 'Sum of Digits',
            difficulty: 'Medium',
            description: 'Read an integer `n` and print the sum of its digits.',
            input_example: '123',
            output_example: '6',
            constraints: 'None',
            test_cases: [
                { input: '123', expected: '6' },
                { input: '456', expected: '15' }
            ],
            starter_code: 'n = int(input())\n# Use a while loop\n'
        },
        {
            id: 'l3',
            title: 'Armstrong Number',
            difficulty: 'Hard',
            description: 'Check if a number is an Armstrong number (e.g., 153 = 1^3 + 5^3 + 3^3). Print "Yes" or "No".',
            input_example: '153',
            output_example: 'Yes',
            test_cases: [
                { input: '153', expected: 'Yes' },
                { input: '123', expected: 'No' }
            ],
            starter_code: 'n = int(input())\n# Your logic here\n',
            tutorial: [
                { step: 1, title: 'Extract Digits', detail: 'Use `% 10` to get the last digit and `// 10` to remove it.', code: 'digit = temp % 10\nsum += digit ** 3\ntemp //= 10' }
            ]
        },
        {
            id: 'l4',
            title: 'Fibonacci Series',
            difficulty: 'Medium',
            description: 'Print the first `n` Fibonacci numbers separated by a space.',
            input_example: '5',
            output_example: '0 1 1 2 3',
            constraints: 'Print on one line.',
            test_cases: [
                { input: '5', expected: '0 1 1 2 3' },
                { input: '3', expected: '0 1 1' }
            ],
            starter_code: 'n = int(input())\n# Fibonacci logic\n'
        }
    ],
    'B4: Strings': [
        {
            id: 's1',
            title: 'Palindrome Check',
            difficulty: 'Easy',
            description: 'Check if a string is a palindrome. Print "Yes" or "No".',
            input_example: 'radar',
            output_example: 'Yes',
            test_cases: [
                { input: 'radar', expected: 'Yes' },
                { input: 'python', expected: 'No' }
            ],
            starter_code: 's = input()\n# Your code here\n',
            tutorial: [
                { step: 1, title: 'String Slicing', detail: 'Use `s[::-1]` to easily reverse a string in Python.', code: 'if s == s[::-1]:' }
            ]
        },
        {
            id: 's2',
            title: 'Count Vowels',
            difficulty: 'Easy',
            description: 'Count the total number of vowels in a given string.',
            input_example: 'Education',
            output_example: '5',
            constraints: 'Ignore case.',
            test_cases: [
                { input: 'Education', expected: '5' },
                { input: 'Python', expected: '1' }
            ],
            starter_code: 's = input().lower()\ncount = 0\n# Loop and count\n'
        },
        {
            id: 's3',
            title: 'Toggle Case',
            difficulty: 'Medium',
            description: 'Change lowercase to uppercase and vice versa in a string.',
            input_example: 'Hello World',
            output_example: 'hELLO wORLD',
            constraints: 'Preserve spaces and special characters.',
            test_cases: [
                { input: 'Hello World', expected: 'hELLO wORLD' },
                { input: 'Python 3', expected: 'pYTHON 3' }
            ],
            starter_code: 's = input()\n# Use swapcase() or loop\n'
        }
    ],
    'B5: Lists': [
        {
            id: 'li1',
            title: 'Linear Search',
            difficulty: 'Medium',
            description: 'Given a target number and a space-separated list, find if the target exists. Print "Found" or "Not Found".',
            input_example: '5\n1 2 5 8 9',
            output_example: 'Found',
            constraints: 'None',
            test_cases: [
                { input: '5\n1 2 5 8 9', expected: 'Found' },
                { input: '10\n1 2 3', expected: 'Not Found' }
            ],
            starter_code: 'target = int(input())\nnums = list(map(int, input().split()))\n# Search logic\n'
        },
        {
            id: 'li2',
            title: 'Second Largest',
            difficulty: 'Hard',
            description: 'Find the second largest number in a list.',
            input_example: '10 20 5 40 30',
            output_example: '30',
            constraints: 'List contains unique or duplicate integers.',
            test_cases: [
                { input: '10 20 5 40 30', expected: '30' },
                { input: '5 5 2 1', expected: '2' }
            ],
            starter_code: 'nums = list(set(map(int, input().split())))\n# Sort and find\n'
        }
    ],
    'B6: Functions': [
        {
            id: 'f1',
            title: 'Area Calculator',
            difficulty: 'Easy',
            description: 'Write a function `area(radius)` that returns the area of a circle (pi=3.14).',
            input_example: '7',
            output_example: '153.86',
            constraints: 'Use pi = 3.14.',
            test_cases: [
                { input: '7', expected: '153.86' },
                { input: '10', expected: '314.0' }
            ],
            starter_code: 'def area(r):\n    return 3.14 * r * r\n\nr = float(input())\nprint(area(r))\n'
        },
        {
            id: 'f2',
            title: 'Default Arguments',
            difficulty: 'Medium',
            description: 'Write a function `greet(name, msg="Hello")` and call it with inputs.',
            input_example: 'Anshu',
            output_example: 'Hello Anshu',
            constraints: 'Function should work for various names.',
            test_cases: [
                { input: 'Anshu', expected: 'Hello Anshu' }
            ],
            starter_code: 'def greet(name, msg="Hello"):\n    print(msg, name)\n\nn = input()\ngreet(n)\n'
        }
    ],
    'B7: File Handling': [
        {
            id: 'fh1',
            title: 'Record Counter',
            difficulty: 'Hard',
            description: 'A file "data.txt" contains several lines of text. Count and print the number of lines starting with "A". Note: We will create the file for you.',
            input_example: 'Apple\nBanana\nApril\nCherry',
            output_example: '2',
            constraints: 'Data is pre-populated in "data.txt".',
            test_cases: [
                { input: 'Apple\nBanana\nApril\nCherry', expected: '2' }
            ],
            starter_code: '# We pre-create data.txt for you\nf = open("data.txt", "r")\n# Your logic here to count lines starting with "A"\n',
            tutorial: [
                { step: 1, title: 'Read Lines', detail: 'Use `f.readlines()` to get a list of all lines.', code: 'lines = f.readlines()' },
                { step: 2, title: 'Logical Check', detail: 'Loop through lines and check `line.startswith("A")`.', code: 'for line in lines:\n    if line.startswith("A"):\n        count += 1' }
            ]
        }
    ],
    'S1: SQL Basics': [
        {
            id: 'sql1',
            title: 'Create Table',
            difficulty: 'Easy',
            description: 'Create a table named "Employee" with columns: EmpID (INT, Primary Key), Name (TEXT), and Salary (INT).',
            input_example: 'None',
            output_example: 'Query executed successfully.',
            constraints: 'Table name: Employee',
            test_cases: [
                { input: '', expected: 'Query executed successfully.' }
            ],
            starter_code: '-- Write your CREATE TABLE query\n',
            tutorial: [
                { step: 1, title: 'Command Structure', detail: 'Use the `CREATE TABLE` statement followed by the table name.', code: 'CREATE TABLE Employee (\n    ...\n);' },
                { step: 2, title: 'Defining Columns', detail: 'List each column name followed by its data type. Separate them with commas.', code: 'EmpID INT PRIMARY KEY,\nName TEXT,\nSalary INT' }
            ]
        },
        {
            id: 'sql2',
            title: 'Insert Records',
            difficulty: 'Easy',
            description: 'Insert two records into the Employee table: (101, "Amit", 50000) and (102, "Sneha", 60000).',
            input_example: 'None',
            output_example: 'Query executed successfully.',
            constraints: 'Ensure columns match the schema.',
            setup_sql: 'CREATE TABLE Employee (EmpID INT PRIMARY KEY, Name TEXT, Salary INT);',
            test_cases: [
                { input: '', expected: 'Query executed successfully.' }
            ],
            starter_code: '-- Pre-created Employee table\nINSERT INTO Employee VALUES (101, "Amit", 50000);\n',
            tutorial: [
                { step: 1, title: 'Insert Syntax', detail: 'Use `INSERT INTO` followed by the table name and `VALUES`.', code: 'INSERT INTO Employee VALUES (...);' },
                { step: 2, title: 'Multiple Rows', detail: 'You can insert multiple rows by separating values with commas or using separate statements.', code: 'INSERT INTO Employee VALUES (101, "Amit", 50000);\nINSERT INTO Employee VALUES (102, "Sneha", 60000);' }
            ]
        }
    ],
    'S2: SQL Aggregates': [
        {
            id: 'sql3',
            title: 'Total Salary',
            difficulty: 'Medium',
            description: 'Find the total (SUM) of salaries from the Employee table.',
            input_example: 'None',
            output_example: '110000',
            constraints: 'Use SUM() function.',
            setup_sql: 'CREATE TABLE Employee (EmpID INT PRIMARY KEY, Name TEXT, Salary INT); INSERT INTO Employee VALUES (101, "Amit", 50000), (102, "Sneha", 60000);',
            test_cases: [
                { input: '', expected: '110000' }
            ],
            starter_code: '-- Use SELECT SUM(Salary) FROM Employee;\n',
            tutorial: [
                { step: 1, title: 'Aggregate Function', detail: 'Use the `SUM()` function to calculate the total of a numeric column.', code: 'SELECT SUM(Salary) FROM Employee;' }
            ]
        }
    ],
    'S3: SQL Joins': [
        {
            id: 'sql4',
            title: 'Simple Equi-Join',
            difficulty: 'Hard',
            description: 'Join "Employee" and "Department" tables on DeptID to show EmpName and DeptName.',
            input_example: 'None',
            output_example: 'Amit HR',
            constraints: 'Use INNER JOIN or WHERE clause.',
            setup_sql: 'CREATE TABLE Employee (EmpID INT, EmpName TEXT, DeptID INT); CREATE TABLE Department (DeptID INT, DeptName TEXT); INSERT INTO Employee VALUES (101, "Amit", 10); INSERT INTO Department VALUES (10, "HR");',
            test_cases: [
                { input: '', expected: 'Amit HR' }
            ],
            starter_code: '-- Join Employee e and Dept d\n',
            tutorial: [
                { step: 1, title: 'Classic Join', detail: 'Use a `WHERE` clause to join tables on a common column.', code: 'SELECT EmpName, DeptName\nFROM Employee, Department\nWHERE Employee.DeptID = Department.DeptID;' },
                { step: 2, title: 'Inner Join Syntax', detail: 'Alternatively, use the `INNER JOIN` keyword for a modern approach.', code: 'SELECT EmpName, DeptName\nFROM Employee\nINNER JOIN Department ON Employee.DeptID = Department.DeptID;' }
            ]
        }
    ],
    'B8: OOP': [
        {
            id: 'oop1',
            title: 'Hero Class Calibration',
            difficulty: 'Easy',
            description: 'Define a class named `Hero` with an `__init__` constructor that accepts `name` (string) and `hp` (integer). Implement a method `take_damage(amount)` that reduces `hp` by `amount` and prints `[name] took damage, hp is now [hp]` to stdout.',
            input_example: 'Arthur\n100\n30',
            output_example: 'Arthur took damage, hp is now 70',
            constraints: 'Define correct class methods.',
            test_cases: [
                { input: 'Arthur\n100\n30', expected: 'Arthur took damage, hp is now 70' },
                { input: 'Neo\n150\n45', expected: 'Neo took damage, hp is now 105' }
            ],
            starter_code: 'class Hero:\n    # Define constructor and take_damage here\n    pass\n\n# Execution logic\nname = input()\nhp = int(input())\ndmg = int(input())\n\nhero = Hero(name, hp)\nhero.take_damage(dmg)\n',
            tutorial: [
                { step: 1, title: 'Constructor Define', detail: 'Initialize object attributes using self inside __init__.', code: 'def __init__(self, name, hp):\n    self.name = name\n    self.hp = hp' },
                { step: 2, title: 'Damage Arithmetic', detail: 'Reduce hp state and print formatted string.', code: 'def take_damage(self, amount):\n    self.hp -= amount\n    print(f"{self.name} took damage, hp is now {self.hp}")' }
            ]
        },
        {
            id: 'oop2',
            title: 'Method Inheritance',
            difficulty: 'Medium',
            description: 'Create a base class `Vehicle` with `__init__(self, brand)` and `drive(self)` which prints `Driving brand`. Create a subclass `ElectricCar` that inherits from `Vehicle` and overrides `drive(self)` to print `Driving electric brand`.',
            input_example: 'Tesla',
            output_example: 'Driving electric Tesla',
            constraints: 'Use class inheritance and override methods.',
            test_cases: [
                { input: 'Tesla', expected: 'Driving electric Tesla' },
                { input: 'Rivian', expected: 'Driving electric Rivian' }
            ],
            starter_code: 'class Vehicle:\n    def __init__(self, brand):\n        self.brand = brand\n    def drive(self):\n        print(f"Driving {self.brand}")\n\n# Create ElectricCar here inheriting from Vehicle\n\nbrand = input()\ncar = ElectricCar(brand)\ncar.drive()\n',
            tutorial: [
                { step: 1, title: 'Subclass Syntax', detail: 'Declare the subclass passing Vehicle parent in parentheses.', code: 'class ElectricCar(Vehicle):' },
                { step: 2, title: 'Method Overriding', detail: 'Define drive(self) inside ElectricCar to print custom output.', code: 'def drive(self):\n    print(f"Driving electric {self.brand}")' }
            ]
        }
    ],
    'B9: APIs & JSON': [
        {
            id: 'api1',
            title: 'Deep Nested JSON Parser',
            difficulty: 'Medium',
            description: 'A mock web API returns a nested JSON user data structure. Write a program that parses the JSON string from standard input and prints the value corresponding to `street` nested inside `address`. Format: `{"user": {"address": {"street": "..."}}}`.',
            input_example: '{"user": {"address": {"street": "Cyber Street 101"}}}',
            output_example: 'Cyber Street 101',
            constraints: 'Use json.loads() module.',
            test_cases: [
                { input: '{"user": {"address": {"street": "Cyber Street 101"}}}', expected: 'Cyber Street 101' },
                { input: '{"user": {"address": {"street": "Matrix Boulevard 404"}}}', expected: 'Matrix Boulevard 404' }
            ],
            starter_code: 'import json\n\ndata_str = input()\n# Parse JSON and print street below\n',
            tutorial: [
                { step: 1, title: 'Parse JSON String', detail: 'Convert JSON text to Python dictionary using json.loads.', code: 'import json\ndata = json.loads(data_str)' },
                { step: 2, title: 'Traverse Keys', detail: 'Access nested items by chaining bracket lookups.', code: 'street = data["user"]["address"]["street"]\nprint(street)' }
            ]
        },
        {
            id: 'api2',
            title: 'HTTP Status Calibration',
            difficulty: 'Easy',
            description: 'Write a program that takes an HTTP response status integer code from standard input and prints its standard string value: `OK` (for 200), `Created` (for 201), `Bad Request` (for 400), `Unauthorized` (for 401), or `Server Error` (for 500). For any other code, print `Unknown`.',
            input_example: '201',
            output_example: 'Created',
            constraints: 'None',
            test_cases: [
                { input: '200', expected: 'OK' },
                { input: '201', expected: 'Created' },
                { input: '400', expected: 'Bad Request' },
                { input: '401', expected: 'Unauthorized' },
                { input: '500', expected: 'Server Error' },
                { input: '404', expected: 'Unknown' }
            ],
            starter_code: 'code = int(input())\n# Code calibration below\n',
            tutorial: [
                { step: 1, title: 'Mapping Dictionary', detail: 'Define status codes mapping to their messages or use if-elif cases.', code: 'status_map = {200: "OK", 201: "Created", 400: "Bad Request", 401: "Unauthorized", 500: "Server Error"}\nprint(status_map.get(code, "Unknown"))' }
            ]
        }
    ],
    'B10: AI & ML Basics': [
        {
            id: 'ai1',
            title: 'Perceptron Activation Gate',
            difficulty: 'Easy',
            description: 'Build a single perceptron activation logic gate. Read three floats from input: `x` (feature), `w` (weight), and `b` (bias) each on a new line. Calculate the activation potential `y = x * w + b`. If `y > 0` print `1`, else print `0`.',
            input_example: '0.5\n-1.2\n0.3',
            output_example: '0',
            constraints: 'Convert inputs to float.',
            test_cases: [
                { input: '0.5\n-1.2\n0.3', expected: '0' },
                { input: '1.5\n0.8\n-0.5', expected: '1' }
            ],
            starter_code: 'x = float(input())\nw = float(input())\nb = float(input())\n# Compute perceptron activation gate below\n',
            tutorial: [
                { step: 1, title: 'Activation potential', detail: 'Multiply weight and inputs then sum the bias.', code: 'y = x * w + b' },
                { step: 2, title: 'Step Trigger', detail: 'Perform simple condition logic to output 0 or 1.', code: 'print(1 if y > 0 else 0)' }
            ]
        },
        {
            id: 'ai2',
            title: 'Mean Squared Error',
            difficulty: 'Medium',
            description: 'Compute Mean Squared Error (MSE) metric between actual predictions `y_pred` and actual targets `y_true`. Read 6 floats from input (first 3 are `y_pred`, next 3 are `y_true`). Print the MSE rounded to 2 decimal places.',
            input_example: '1.0\n2.0\n3.0\n1.2\n1.8\n3.1',
            output_example: '0.03',
            constraints: 'Use round(val, 2) on print.',
            test_cases: [
                { input: '1.0\n2.0\n3.0\n1.2\n1.8\n3.1', expected: '0.03' },
                { input: '10.5\n8.2\n9.0\n10.0\n8.5\n9.2', expected: '0.13' }
            ],
            starter_code: 'pred = [float(input()) for _ in range(3)]\ntrue = [float(input()) for _ in range(3)]\n# Compute and print MSE metric below\n',
            tutorial: [
                { step: 1, title: 'Squared Differences', detail: 'Calculate the squared variance index per element.', code: 'sq_diffs = [(p - t) ** 2 for p, t in zip(pred, true)]' },
                { step: 2, title: 'Mean & Formatting', detail: 'Compute the average of squared differences and round it.', code: 'mse = sum(sq_diffs) / len(pred)\nprint(round(mse, 2))' }
            ]
        }
    ]
};
