export const ARENA_PROBLEMS = [
    {
        id: 'arena_easy_1',
        title: 'Bracket Match Calibration',
        difficulty: 'Easy',
        description: 'Read a string containing parentheses `(`, `)`, brackets `[`, `]`, and braces `{`, `}` from stdin. Verify if they are correctly balanced in nested order. Output `True` if balanced, or `False` otherwise.',
        input_example: '{[()]}',
        output_example: 'True',
        starter_code: `def is_balanced(s)
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack[-1] != mapping[char]
                return False
            stack.pop()
        else:
            # Ignore other characters
            pas
            
    return len(stack) = 0

s = input()
print(is_balanced(s))
`,
        test_cases: [
            { input: '{[()]}', expected: 'True' },
            { input: '[(])', expected: 'False' },
            { input: '(', expected: 'False' },
            { input: '', expected: 'True' }
        ],
        bugs: [
            'Missing colon (:) in function definition `def is_balanced(s)` on line 1.',
            'Missing colon (:) in conditional check `stack[-1] != mapping[char]` on line 8.',
            'Syntax error on line 12: typo in keyword `pas` (should be `pass`).',
            'Logical error on line 14: single equals sign `=` (assignment) inside `len(stack) = 0` instead of comparison `==`.'
        ],
        hints: [
            'Check line 1 and line 8. Make sure every block statement ends with a colon (`:`)!',
            'Look closely at line 12. "pas" is not a valid Python command; did you mean "pass"?',
            'On line 14, are you comparing the length to 0, or trying to assign 0 to a function call? Remember that comparison uses `==`.'
        ]
    },
    {
        id: 'arena_medium_1',
        title: 'Recursive Sequence Safeguard',
        difficulty: 'Medium',
        description: 'Implement a recursive function `fib(n)` to calculate the n-th Fibonacci number (where fib(0) = 0, fib(1) = 1, fib(2) = 1, etc.). Read an integer `n` from stdin and print `fib(n)`. Ensure the code works efficiently without infinite stack overflows!',
        input_example: '6',
        output_example: '8',
        starter_code: `memo = {}

def fib(n):
    # Retrieve from cache if exists
    if n in memo:
        return memo[n]
        
    # Base cases
    if n == 0:
        return 0
    elif n == 1:
        return 0  # Bug: should return 1
        
    # Recursive calculation
    result = fib(n - 1) + fib(n - 2)
    memo[n] = result
    return result

n = int(input())
# Bug: passing negative numbers might crash if not validated or if n is read incorrectly
print(fib(n))
`,
        test_cases: [
            { input: '0', expected: '0' },
            { input: '1', expected: '1' },
            { input: '6', expected: '8' },
            { input: '10', expected: '55' }
        ],
        bugs: [
            'Logical error in base cases on line 11: `fib(1)` returns `0` instead of `1`, causing all subsequent computations to be incorrect.',
            'Boundary logic: If `n` is negative, the recursion will run infinitely resulting in a RecursionError. We should add a safety guard for negative inputs.'
        ],
        hints: [
            'Check the Fibonacci base case: what is the value of the 1st Fibonacci number? Should `fib(1)` return `0` or `1`?',
            'What happens if someone passes a negative value of `n`? Add a safeguard to return `0` if `n <= 0` or similar.'
        ]
    },
    {
        id: 'arena_hard_1',
        title: 'Prime Search Acceleration',
        difficulty: 'Hard',
        description: 'Read an integer `N` from standard input. Find and print all prime numbers up to and including `N`, separated by a single space. Optimize the nested checks to run in sub-millisecond durations (under O(N^2) complexity).',
        input_example: '10',
        output_example: '2 3 5 7',
        starter_code: `def get_primes(limit):
    if limit < 2:
        return []
        
    primes = []
    # Check numbers up to limit
    for num in range(2, limit + 1):
        is_prime = True
        # Inefficient loop running O(N) instead of O(sqrt(N))
        for i in range(2, num):
            if num % i == 0:
                is_prime = False
                # Bug: missing break statement makes loop keep running unnecessarily
                
        if is_prime:
            primes.append(num)
            
    return primes

n = int(input())
primes_list = get_primes(n)
# Bug: printing format should join with a space
print(primes_list)
`,
        test_cases: [
            { input: '10', expected: '2 3 5 7' },
            { input: '2', expected: '2' },
            { input: '20', expected: '2 3 5 7 11 13 17 19' },
            { input: '1', expected: '' }
        ],
        bugs: [
            'Inefficient Prime Check: The inner loop checks all integers `i` from `2` up to `num - 1`. This leads to O(N^2) complexity. It should only check up to `int(num**0.5)`.',
            'Missing break statement in inner loop: when a divisor is found, `is_prime` becomes `False` but it keeps looping unnecessarily.',
            'Formatting Error: `print(primes_list)` outputs a Python list bracket format `[2, 3, 5, 7]` instead of a space-separated string `2 3 5 7`.'
        ],
        hints: [
            'To optimize the prime search, did you know you only need to check divisions up to the square root of the number? Change the inner loop range to `range(2, int(num**0.5) + 1)`.',
            'Inside the inner loop, once you discover that `num % i == 0`, is there any point in checking further numbers? Use a `break` statement to stop immediately.',
            "Check the final print statement! We need the numbers separated by spaces, not a bracketed Python list. Try using ' '.join(map(str, primes_list))."
        ]
    }
];

export const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Anshu_99', title: 'Grandmaster Debugger', points: 15450, solved: 142, speed: '12.4s', winRate: '94%' },
    { rank: 2, name: 'BitShift_Wizard', title: 'Elite Fixer', points: 14200, solved: 130, speed: '14.1s', winRate: '89%' },
    { rank: 3, name: 'Matrix_Neo', title: 'Algorithm Overlord', points: 13950, solved: 125, speed: '11.8s', winRate: '91%' },
    { rank: 4, name: 'Pythonic_Sage', title: 'Compiler Guru', points: 12100, solved: 112, speed: '16.5s', winRate: '85%' },
    { rank: 5, name: 'Debug_Slayer', title: 'Bug Bounty Hunter', points: 11800, solved: 108, speed: '15.2s', winRate: '88%' },
    { rank: 6, name: 'ByteMe', title: 'Expert Optimiser', points: 10500, solved: 95, speed: '18.1s', winRate: '81%' },
    { rank: 7, name: 'Coffee_Coder', title: 'Syntax Survivor', points: 9800, solved: 88, speed: '19.4s', winRate: '78%' },
    { rank: 8, name: 'Recursion_Lord', title: 'Stack Overflow King', points: 8900, solved: 79, speed: '21.0s', winRate: '75%' }
];

export const MOCK_TOURNAMENTS = [
    {
        id: 'tour_active',
        title: 'Weekly Debugging Clash #23',
        status: 'LIVE NOW',
        timeLeft: '04:12:45',
        registered: true,
        participants: 1248,
        xpPool: 2500,
        difficulty: 'Medium-Hard',
        description: 'Battle in a 5-round rapid compilation fire! Find edge cases in recursive dynamic programming scripts and optimize database indexing loops.'
    },
    {
        id: 'tour_up_1',
        title: 'Cyberpunk Optimization Cup',
        status: 'UPCOMING',
        startDate: 'Tomorrow, 18:00',
        registered: false,
        participants: 412,
        xpPool: 5000,
        difficulty: 'Hard Only',
        description: 'Strict speed optimization challenge. Transform high-complexity O(N^2) subroutines into optimal O(N) or O(N log N) models.'
    },
    {
        id: 'tour_up_2',
        title: 'Dracula Syntax Arena',
        status: 'UPCOMING',
        startDate: 'In 3 Days, 20:00',
        registered: false,
        participants: 844,
        xpPool: 1500,
        difficulty: 'Easy-Medium',
        description: 'Focus on pure syntax matching and lexical issues. Clean up broken compilers, missing decorators, and invalid exception handlings.'
    }
];

export const MOCK_CHAMPIONS = [
    { position: 2, name: 'BitShift_Wizard', score: 2850, avatar: '🥈' },
    { position: 1, name: 'Anshu_99', score: 3200, avatar: '👑' },
    { position: 3, name: 'Matrix_Neo', score: 2700, avatar: '🥉' }
];
