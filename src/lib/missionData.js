// Static database of interactive coding missions for Py Compiler X
// Covers 7 mission types and 4 difficulty levels with precise validation test suites.

export const MISSION_TYPES = {
    fix_broken_code: { label: 'Fix Broken Code', color: '#f87171' },
    build_mini_project: { label: 'Build Mini Project', color: '#60a5fa' },
    optimize_slow_code: { label: 'Optimize Slow Code', color: '#fbbf24' },
    predict_output: { label: 'Predict Output', color: '#34d399' },
    find_hidden_bugs: { label: 'Find Hidden Bugs', color: '#c084fc' },
    logic_puzzle: { label: 'Complete Logic Puzzle', color: '#fb923c' },
    ai_assisted: { label: 'AI-Assisted Coding', color: '#2dd4bf' }
};

export const DIFFICULTY_LEVELS = {
    beginner: { label: 'Beginner', xpMultiplier: 1.0, color: '#10b981', hpMultiplier: 1.0 },
    intermediate: { label: 'Intermediate', xpMultiplier: 1.5, color: '#3b82f6', hpMultiplier: 1.2 },
    advanced: { label: 'Advanced', xpMultiplier: 2.0, color: '#8b5cf6', hpMultiplier: 1.5 },
    legendary: { label: 'Legendary', xpMultiplier: 3.0, color: '#f59e0b', hpMultiplier: 2.0 }
};

export const MISSIONS = [
    {
        id: 'mission_list_squarer',
        title: 'Syntax Repair: List Squarer',
        type: 'fix_broken_code',
        difficulty: 'beginner',
        xp: 50,
        briefing: 'Fix the syntax and execution errors in the `square_numbers` function. The function is supposed to take a list of numbers and return a list of their squares, but currently contains syntax anomalies and incorrect list API usage.',
        initialCode: `def square_numbers(nums)
    squared = []
    for n in nums
        squared.add(n ** 2)
    return squared
`,
        solutionHint: 'Make sure to add colons (:) at the ends of the function definition and the for-loop header. Also, in Python, list additions are made using the `.append()` method, not `.add()`.',
        validationType: 'tests',
        validationAppend: `
# Automation Verification
print(square_numbers([1, 2, 3]))
print(square_numbers([5, 10]))
`,
        expectedStdout: '[1, 4, 9]\n[25, 100]\n'
    },
    {
        id: 'mission_scopes_loops',
        title: 'Neural Prediction: Scopes & Loops',
        type: 'predict_output',
        difficulty: 'beginner',
        xp: 50,
        briefing: 'Analyze the nested operations and scope management in the python code snippet. Predict the exact output that will be printed in the console.',
        codeSnippet: `x = 10
def double_add():
    global x
    x = x * 2
    for i in range(3):
        x += i

double_add()
print(x)
`,
        validationType: 'prediction',
        choices: [
            '20',
            '23',
            '26',
            '30'
        ],
        correctPrediction: '23',
        explanation: 'The variable `x` starts at 10. Calling `double_add()` scales `x` to 20 via the global flag. Then, the loop runs for i = 0, 1, 2. `x` is added by 0 (20), then 1 (21), and finally 2 (23). Hence, output is 23.'
    },
    {
        id: 'mission_factorial_guard',
        title: 'Anomaly Hunt: Factorial Guard',
        type: 'find_hidden_bugs',
        difficulty: 'beginner',
        xp: 50,
        briefing: 'The recursive factorial calculation works for simple inputs, but it hangs indefinitely or raises recursive stack overflow issues for negative inputs. Fix the hidden bugs by adding a safeguard boundary validation and correcting the multiplication logic.',
        initialCode: `def factorial(n):
    if n == 0:
        return 1
    # Find the boundary error & recursive leak
    return n * factorial(n - 1)
`,
        solutionHint: 'Add a check at the top: if `n < 0`, return `None` (or 0). Also check if your base case handles `n <= 1` cleanly for safety.',
        validationType: 'tests',
        validationAppend: `
# Automation Verification
print(factorial(5))
print(factorial(-3))
`,
        expectedStdout: '120\nNone\n'
    },
    {
        id: 'mission_binary_search',
        title: 'Anomaly Hunt: Binary Search bounds',
        type: 'find_hidden_bugs',
        difficulty: 'intermediate',
        xp: 100,
        briefing: 'A junior programmer implemented a Binary Search algorithm, but it gets locked in infinite loops when searching for certain numbers or missing values. Find and repair the boundary update bug inside the while-loop.',
        initialCode: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid # Anomaly here
        else:
            high = mid # Anomaly here
    return -1
`,
        solutionHint: 'When target is larger than mid, low must be updated to `mid + 1`, and when it is smaller, high must be updated to `mid - 1` to continuously narrow the partition. Otherwise, low and high can get stuck at mid.',
        validationType: 'tests',
        validationAppend: `
# Automation Verification
print(binary_search([1, 3, 5, 7, 9], 5))
print(binary_search([1, 3, 5, 7, 9], 3))
print(binary_search([1, 3, 5, 7, 9], 8))
`,
        expectedStdout: '2\n1\n-1\n'
    },
    {
        id: 'mission_array_rotate',
        title: 'Logic Riddle: Array Rotate',
        type: 'logic_puzzle',
        difficulty: 'intermediate',
        xp: 100,
        briefing: 'Create an index shifting puzzle! Implement `rotate_array(arr, k)` that rotates an array of integers to the right by `k` steps, where `k` is non-negative. Note that `k` can be larger than the size of the array itself!',
        initialCode: `def rotate_array(arr, k):
    # Complete your logic rotation puzzle
    pass
`,
        solutionHint: 'First calculate the actual rotational offset: `k = k % len(arr)`. Then you can slice python lists cleanly: `return arr[-k:] + arr[:-k]`. Make sure to handle empty arrays safely!',
        validationType: 'tests',
        validationAppend: `
# Automation Verification
print(rotate_array([1, 2, 3, 4, 5], 2))
print(rotate_array([10, 20, 30], 4))
`,
        expectedStdout: '[4, 5, 1, 2, 3]\n[30, 10, 20]\n'
    },
    {
        id: 'mission_dict_comprehension',
        title: 'Neural Prediction: Dict Sifting',
        type: 'predict_output',
        difficulty: 'intermediate',
        xp: 100,
        briefing: 'Predict the sorting order and key-value mapping generated by this dictionary comprehension in Python.',
        codeSnippet: `data = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
out = {k: v**2 for k, v in data.items() if v % 2 == 0}
print(sorted(out.items()))
`,
        validationType: 'prediction',
        choices: [
            "[('a', 1), ('c', 9)]",
            "[('b', 4), ('d', 16)]",
            "[('b', 2), ('d', 4)]",
            "[('a', 1), ('b', 4), ('c', 9), ('d', 16)]"
        ],
        correctPrediction: "[('b', 4), ('d', 16)]",
        explanation: 'The dictionary filtering checks if the values are divisible by 2 (even values, i.e., b=2, d=4). Then it squares those values (2**2=4, 4**2=16). `sorted(out.items())` formats them as a sorted list of tuples: [(\'b\', 4), (\'d\', 16)].'
    },
    {
        id: 'mission_caesar_cipher',
        title: 'Tactical Project: Caesar Cipher',
        type: 'build_mini_project',
        difficulty: 'intermediate',
        xp: 150,
        briefing: 'Build a fully-functional cryptography encoder module. Write `caesar_encrypt(text, shift)` that takes a string of uppercase alphabetic letters and a positive shift key, shifting all characters forward, while preserving space characters in their original positions.',
        initialCode: `def caesar_encrypt(text, shift):
    # Build your cryptography engine code
    pass
`,
        solutionHint: 'Loop through the characters in `text`. If the character is a space, append it unchanged. If it is alphabetic, calculate the 0-indexed alphabet code via `code = ord(char) - ord("A")`, apply the shift modulo 26, and translate back via `chr(ord("A") + shifted_code)`.',
        validationType: 'tests',
        validationAppend: `
# Automation Verification
print(caesar_encrypt("HELLO WORLD", 3))
print(caesar_encrypt("CYBERPUNK", 5))
`,
        expectedStdout: 'KHOOR ZRUOG\nHDEJWUZSP\n'
    },
    {
        id: 'mission_memoized_fib',
        title: 'Core Optimization: Memoized Fibonacci',
        type: 'optimize_slow_code',
        difficulty: 'advanced',
        xp: 250,
        briefing: 'A standard recursive Fibonacci solver has an exponential $O(2^N)$ time complexity, causing major thread lockups. Optimize this algorithm to run in linear $O(N)$ time. The validation will test `fib(35)` which must resolve in less than 500 milliseconds!',
        initialCode: `def fib(n):
    # Optimize this recursive leak!
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)
`,
        solutionHint: 'Avoid exponential call stacks by using a cache dictionary (Memoization) or an iterative loop to accumulate the sum: `a, b = 0, 1` then loop $N$ times replacing `a, b = b, a + b`.',
        validationType: 'performance',
        maxDurationMs: 500,
        validationAppend: `
# Automation Verification
print(fib(35))
`,
        expectedStdout: '9227465\n'
    },
    {
        id: 'mission_token_sanitizer',
        title: 'Neural Assist: Token Sanitizer',
        type: 'ai_assisted',
        difficulty: 'advanced',
        xp: 250,
        briefing: 'Implement a token filtering engine `sanitize_tokens(tokens)`. Working beside your AI Companion (check the neural dashboard in the sidebar for code snippets), filter out any strings that do not constitute valid hexadecimal values, and normalize the remaining valid tokens to standard lowercase.',
        initialCode: `def sanitize_tokens(tokens):
    # Utilize the regex logic supplied in the AI Assistant sidebar
    pass
`,
        aiSidebarInstructions: `🧠 **AI Companion Transmission**:
Here is the core logic blocks you need for validation, Operator:

1. Import the regular expression engine:
   \`import re\`
2. Hexadecimal tokens strictly contain digits (0-9) and characters (a-f, A-F). The regular expression matching string is:
   \`r"^[0-9a-fA-F]+$"\`
3. Filter out items using \`re.match(pattern, token)\`.
4. Return the filtered list with elements converted to lowercase via \`token.lower()\`.

Get compiling!`,
        solutionHint: 'Import `re` inside your script, then iterate through the tokens. For each token, check if `re.match(r"^[0-9a-fA-F]+$", token)` is true. If it is, convert the token to lowercase and append it to your output list.',
        validationType: 'tests',
        validationAppend: `
# Automation Verification
print(sanitize_tokens(["0xEF", "abcd", "xyz", "12AF"]))
`,
        expectedStdout: "['abcd', '12af']\n"
    },
    {
        id: 'mission_prime_sieve',
        title: 'Legendary Sieve: Prime Counter',
        type: 'optimize_slow_code',
        difficulty: 'legendary',
        xp: 500,
        briefing: 'Count prime numbers efficiently! A simple brute-force prime checker times out when executing counts for large thresholds. Optimize `count_primes(n)` using the Sieve of Eratosthenes to calculate the exact number of primes below 50,000. It must execute inside 250ms!',
        initialCode: `def count_primes(n):
    # Optimize to execute under 250ms for n=50000
    count = 0
    for i in range(2, n):
        is_prime = True
        for j in range(2, int(i**0.5) + 1):
            if i % j == 0:
                is_prime = False
                break
        if is_prime:
            count += 1
    return count
`,
        solutionHint: 'Implement the Sieve of Eratosthenes. Maintain a boolean list of size $N$ initialized to True. Starting from 2 up to $\\sqrt{N}$, if index $i$ is prime, mark all its multiples as False. Finally, return the count of indices remaining True.',
        validationType: 'performance',
        maxDurationMs: 250,
        validationAppend: `
# Automation Verification
print(count_primes(50000))
`,
        expectedStdout: '5133\n'
    },
    {
        id: 'mission_maze_solver',
        title: 'Neural Solder: Graph Pathfinder',
        type: 'ai_assisted',
        difficulty: 'legendary',
        xp: 500,
        briefing: 'Find the shortest path out of the neural grid array! Complete `find_path(grid, start, end)` to navigate a 2D matrix where `0` represents empty spaces and `1` represents solid walls. Return a list of tuples representing the shortest coordinates path. Your AI Assistant is standing by in the sidebar with active queue templates.',
        initialCode: `def find_path(grid, start, end):
    # Build a Breadth-First-Search (BFS) solver
    pass
`,
        aiSidebarInstructions: `🧠 **AI Companion Transmission**:
BFS is guaranteed to find the shortest path in an unweighted grid, Operator. Follow this pathfinder logic:

1. Initialize a queue with your start path:
   \`queue = [(start, [start])]\`
2. Maintain a set to keep track of visited coordinates:
   \`visited = {start}\`
3. While the queue contains elements:
   - Pop the first item: \`current, path = queue.pop(0)\`
   - If \`current == end\`, you have won! Return the \`path\`.
   - Traverse the four cardinal neighbors: \`(row + dr, col + dc)\` for directions \`[(-1,0), (1,0), (0,-1), (0,1)]\`.
   - If neighbor is within bounds, is a \`0\` in the grid, and not yet in \`visited\`: add to visited and append to queue:
     \`queue.append((neighbor, path + [neighbor]))\`

This will compute the perfect coordinate list!`,
        solutionHint: 'Implement Breadth-First Search (BFS) using a queue to store tuples of `(current_node, path_taken)`. Enforce bounds checks: `0 <= r < len(grid)` and `0 <= c < len(grid[0])` to prevent indexing crashes.',
        validationType: 'tests',
        validationAppend: `
# Automation Verification
grid = [
    [0, 0, 1, 0],
    [1, 0, 1, 0],
    [0, 0, 0, 0],
    [0, 1, 1, 0]
]
print(find_path(grid, (0, 0), (2, 3)))
`,
        expectedStdout: '[(0, 0), (0, 1), (1, 1), (2, 1), (2, 2), (2, 3)]\n'
    },
    {
        id: 'mission_anagram_sorcerer',
        title: 'Boss Battle: Anagram Sorcerer',
        type: 'logic_puzzle',
        difficulty: 'legendary',
        xp: 500,
        briefing: 'Slay the Anagram Sorcerer! You are locked in a room where every chest requires organizing scattered letters. Write `is_anagram_group(words)` that groups a list of scrambled strings into anagram sublists. The output must return a list of lists, where subgroups are sorted by their size.',
        initialCode: `def is_anagram_group(words):
    # Group anagram list elements together
    pass
`,
        solutionHint: 'Use a dictionary where the keys are sorted strings (e.g. `tuple(sorted(word))`) and values are lists of matching anagrams. To sort the final subgroups, return: `sorted(dict.values(), key=len)`.',
        validationType: 'tests',
        validationAppend: `
# Automation Verification
groups = is_anagram_group(["eat", "tea", "tan", "ate", "nat", "bat"])
# Sort individual subsets and overall groups to guarantee matches regardless of order
norm_groups = sorted([sorted(g) for g in groups], key=lambda x: (len(x), x))
print(norm_groups)
`,
        expectedStdout: "[['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']]\n"
    }
];
