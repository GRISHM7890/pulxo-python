export const PRACTICE_TOPICS = [
    'B1: Basics',
    'B2: Conditionals',
    'B3: Loops',
    'B4: Strings',
    'B5: Lists',
    'B6: Functions',
    'B7: File Handling',
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
    ]
};
