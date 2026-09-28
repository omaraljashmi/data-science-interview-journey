(function () {
  "use strict";

  const mastery = ["Unseen", "Learned", "Guided", "Independent", "Retained", "Interview-ready"];

  const tracks = [
    { id: "python", title: "Python, DSA & LeetCode", short: "Python + DSA", icon: "⌘", color: "#4f78ff", chapters: 8, description: "Fluency with core structures, patterns, and interview problem solving." },
    { id: "sql", title: "SQL", short: "SQL", icon: "⌗", color: "#7c5ce7", chapters: 7, description: "Queries from clean joins to analytical windows and debugging." },
    { id: "statistics", title: "Statistics", short: "Statistics", icon: "∿", color: "#e35d8f", chapters: 7, description: "Inference, uncertainty, distributions, and practical reasoning." },
    { id: "ml", title: "Machine Learning", short: "Machine learning", icon: "◇", color: "#00a884", chapters: 9, description: "Model choice, evaluation, features, trade-offs, and failure modes." },
    { id: "experiments", title: "A/B Testing & Experimentation", short: "Experimentation", icon: "A/B", color: "#df8f2f", chapters: 6, description: "Design trustworthy experiments and interpret them responsibly." },
    { id: "cases", title: "Product & Data Cases", short: "Product cases", icon: "◫", color: "#087ea4", chapters: 7, description: "Frame ambiguous questions, choose metrics, and make decisions." },
    { id: "interviews", title: "Mock Interviews", short: "Mock interviews", icon: "◉", color: "#c44c4c", chapters: 5, description: "Timed practice, communication, reflection, and full-loop readiness." }
  ];

  const lessons = [
    {
      id: "big-o",
      number: "1.1",
      title: "Big-O Complexity",
      eyebrow: "Foundations",
      duration: 16,
      kind: "concept",
      summary: "Reason about how work and memory grow as inputs get larger.",
      objective: "Compare common time and space complexities without counting every operation.",
      concept: [
        "Big-O describes the growth of resource use as input size n increases. It is a model for comparing approaches—not a stopwatch.",
        "Focus on the dominant term and drop constant factors. Two passes over n items are O(2n), which simplifies to O(n).",
        "The same language describes memory: space complexity counts the extra storage an approach allocates as n grows, not the input itself."
      ],
      workedExample: {
        prompt: "What is the time complexity of checking every pair in a list?",
        steps: [
          "The outer loop visits n values.",
          "For each value, the inner loop can visit n values.",
          "n × n operations grows as O(n²)."
        ],
        takeaway: "Nested loops do not always mean O(n²), but two full input-sized loops nested together do."
      },
      misconceptions: [
        { trap: "O(1) means instant.", fix: "It means the cost does not grow with n. A constant step can still be slow." },
        { trap: "Two consecutive loops are O(n²).", fix: "Sequential loops add: O(n + n) = O(n). Only nested loops multiply." },
        { trap: "Big-O predicts exact runtime.", fix: "It compares growth rates and drops constants. Use it to choose an approach, not to time it." }
      ],
      questions: [
        { id: "bigo-q1", prompt: "A loop visits each item in nums once. What is its time complexity?", code: "for x in nums:\n    print(x)", options: ["O(1), print is a constant step", "O(log n)", "O(n)", "O(n²)"], answer: 2, explain: "The body runs once per element, so work grows linearly with n, however cheap each step is.", misconception: "A single pass over n items is O(n), even when the loop body is simple." },
        { id: "bigo-q2", prompt: "Which change trades extra memory for faster repeated lookups?", options: ["Sort the list once, then binary search", "Store the values in a set", "Scan the list with `in` each time", "Cache only the most recent lookup"], answer: 1, explain: "A set spends O(n) extra space to make each membership check average O(1). Sorting spends time up front, not memory, and still leaves O(log n) lookups.", misconception: "Hashing exchanges memory for speed. Sorting exchanges preprocessing time for O(log n) lookups." },
        { id: "bigo-q3", prompt: "Two separate loops each scan n items, one after the other. What is the combined complexity?", options: ["O(n)", "O(2n), and the 2 is kept", "O(n²)", "O(n log n)"], answer: 0, explain: "O(n + n) = O(2n), and constants are dropped, leaving O(n).", misconception: "Sequential loops add; nested loops multiply." },
        { id: "bigo-q4", prompt: "What is the time complexity of this loop?", code: "while n > 1:\n    n = n // 2", options: ["O(1)", "O(log n)", "O(n)", "O(√n)"], answer: 1, explain: "Halving n each step takes about log₂ n steps to reach 1.", misconception: "Shrinking the input by a constant factor each step is logarithmic, not linear." },
        { id: "bigo-q5", prompt: "A function builds a new list of n items and then loops over it once. What are its time and space costs?", options: ["O(n) time, O(1) space", "O(n) time, O(n) space", "O(n²) time, O(n) space", "O(1) time, O(n) space"], answer: 1, explain: "Building n items is O(n) time and O(n) extra space; the second pass adds O(n) time and nothing to space.", misconception: "Space counts what you allocate, not how quickly you touch it." }
      ]
    },
    {
      id: "arrays",
      number: "1.2",
      title: "Arrays & Lists",
      eyebrow: "Core structures",
      duration: 18,
      kind: "concept",
      summary: "Use indexing, iteration, slicing, and mutation with clear complexity instincts.",
      objective: "Choose list operations intentionally and spot hidden linear work.",
      concept: [
        "Python lists are dynamic arrays. Indexing is O(1), while searching by value is O(n).",
        "Appending is amortized O(1): an occasional resize costs O(n), but averaged over many appends each one is constant. Inserting or deleting near the front shifts every later item, making it O(n)."
      ],
      workedExample: {
        prompt: "You need the final item and then append one value. What operations fit?",
        steps: ["Read nums[-1] in O(1).", "Use nums.append(value), amortized O(1).", "Avoid copying the list unless a separate value is required."],
        takeaway: "A list is strongest when you access by position and add or remove near the end."
      },
      misconceptions: [
        { trap: "All list operations are O(1).", fix: "Indexing, append and pop from the end are. Search, and insert or delete near the front, are O(n)." },
        { trap: "Slicing is free.", fix: "A slice copies k references, so nums[:] costs O(n) time and space." },
        { trap: "`in` on a list uses a hash lookup.", fix: "It scans from the start. Convert to a set when you need repeated membership checks." }
      ],
      questions: [
        { id: "array-q1", prompt: "Which Python list operation is O(n)?", options: ["nums[3]", "nums.append(7)", "nums.insert(0, 7)", "nums.pop()"], answer: 2, explain: "Inserting at the front shifts every existing element one slot to the right. The other three touch only one end.", misconception: "Position matters: edits near the front of an array require shifting." },
        { id: "array-q2", prompt: "What is the space cost of nums[:] for a list of n items?", options: ["O(1), a slice is a view of the original", "O(n), a new list of n references", "O(n²), every element is copied deeply", "O(log n)"], answer: 1, explain: "A Python list slice is a copy, not a view. It allocates a new list holding n references.", misconception: "Concise syntax can still allocate memory proportional to input size." },
        { id: "array-q3", prompt: "What does `7 in nums` cost when nums is a plain list of n items?", options: ["O(1), lists hash their contents", "O(log n), lists stay sorted", "O(n), it scans until a match", "O(n²)"], answer: 2, explain: "A list has no index of its values, so `in` compares element by element from the front.", misconception: "`in` is fast on sets and dictionaries, not on lists." },
        { id: "array-q4", prompt: "What does nums.pop() with no argument cost?", options: ["O(1)", "O(n), later items shift left", "O(log n)", "O(n), the list is copied first"], answer: 0, explain: "Removing the last element leaves every other position unchanged, so nothing shifts.", misconception: "Only removals before the end make later items shift." }
      ]
    },
    {
      id: "hash-maps",
      number: "1.3",
      title: "Hash Maps & Sets",
      eyebrow: "Core structures",
      duration: 20,
      kind: "concept",
      summary: "Turn repeated searches into fast lookups with dictionaries and sets.",
      objective: "Recognize when membership, counting, or complement lookup calls for hashing.",
      concept: [
        "Sets store unique hashable values. Dictionaries map hashable keys to values. Both offer average O(1) lookup, insertion, and deletion.",
        "Hashing is the classic way to replace a repeated O(n) scan with a lookup, often reducing O(n²) solutions to O(n)."
      ],
      workedExample: {
        prompt: "How can you detect a repeated value in one pass?",
        steps: ["Create an empty set named seen.", "For each value, return true if it is already in seen.", "Otherwise add it and continue."],
        takeaway: "The set stores exactly the information future iterations need."
      },
      misconceptions: [
        { trap: "Hash lookup is worst-case O(1).", fix: "Average O(1). Heavy collisions can degrade a lookup to O(n), which is why interviewers say ‘expected’." },
        { trap: "Sets preserve duplicates.", fix: "A set holds each value once. Adding an existing value changes nothing." },
        { trap: "Any Python value can be a dictionary key.", fix: "Keys must be hashable: numbers, strings and tuples work; lists, sets and dicts do not." }
      ],
      questions: [
        { id: "hash-q1", prompt: "You scan a list once and need to know, at each step, whether the current value appeared earlier. Which choice keeps the whole pass O(n)?", options: ["A list `seen`, checking `value in seen`", "A set `seen`, checking `value in seen`", "A sorted copy with binary search", "A dictionary mapping index → value"], answer: 1, explain: "Set membership is average O(1), so n checks stay O(n). The same check on a list scans and makes the pass O(n²).", misconception: "`in` on a list scans; `in` on a set hashes. Same syntax, different cost." },
        { id: "hash-q2", prompt: "What can a dictionary give you that a set cannot?", options: ["Unique membership only", "A value stored with each key", "Guaranteed O(1) worst case", "Support for list keys"], answer: 1, explain: "A dictionary stores key → value associations, such as number → index or word → count.", misconception: "Use a dictionary when the lookup must return information, not just yes or no." },
        { id: "hash-q3", prompt: "Which of these can be a dictionary key?", options: ["A list [1, 2]", "A tuple (1, 2)", "A set {1, 2}", "A dictionary {1: 2}"], answer: 1, explain: "Keys must be hashable, which in practice means immutable. Tuples of hashable items qualify; lists, sets and dicts do not.", misconception: "Hashability, not size, decides what can be a key." },
        { id: "hash-q4", prompt: "What is the worst case for a single hash lookup?", options: ["O(1), always", "O(log n)", "O(n), when many keys collide", "O(n²)"], answer: 2, explain: "Hash tables are average O(1). Pathological collisions can put many keys in one bucket, which degrades a lookup to O(n).", misconception: "Say ‘average’ or ‘expected’ O(1) in interviews; it is not a guarantee." },
        { id: "hash-q5", prompt: "Count how many times each word appears in one pass. Which structure fits?", options: ["A set of words", "A dictionary word → count", "A list of (word, count) pairs", "Two nested loops over the words"], answer: 1, explain: "Each word is a key and its count is the value, updated in O(1) per word.", misconception: "When you need a number per item, you need a dictionary, not a set." }
      ]
    },
    {
      id: "contains-duplicate",
      number: "1.4",
      title: "Contains Duplicate",
      eyebrow: "Pattern practice",
      duration: 24,
      kind: "coding",
      summary: "Apply set membership to replace a quadratic pairwise search.",
      objective: "Implement and explain an O(n)-time duplicate check.",
      concept: [
        "The question asks whether a value has appeared before. That is a membership problem, so a set is the natural tool.",
        "A one-line length comparison is valid, but the one-pass version reveals the reusable interview pattern."
      ],
      workedExample: {
        prompt: "Trace [4, 1, 7, 1] with a seen set.",
        steps: ["See 4 → add it: {4}.", "See 1 → add it: {4, 1}.", "See 7 → add it: {4, 1, 7}.", "See 1 → already present, so return True."],
        takeaway: "Check first, then add. That order asks whether the current value appeared earlier."
      },
      misconceptions: [
        { trap: "The set must be pre-filled.", fix: "Start empty. It fills as you scan, so it only ever holds values you have already passed." },
        { trap: "Sorting is always the best solution.", fix: "Sorting is O(n log n) with O(1) extra space; the set is O(n) time with O(n) space. Name the trade-off out loud." },
        { trap: "Return False inside the loop after one unique value.", fix: "Return False only after the whole scan finishes without a repeat." }
      ],
      questions: [
        { id: "dup-q1", prompt: "Why check `num in seen` before adding num to the set?", options: ["Adding first would make every value look like a repeat", "A set can only be checked once per value", "It keeps the set sorted", "It lets the loop stop early on unique values"], answer: 0, explain: "If you add first, the membership test always finds the value you just added and returns True on the first element.", misconception: "The order of state updates changes what the membership test means." },
        { id: "dup-q2", prompt: "What are the expected costs of the one-pass set solution?", options: ["O(n) time, O(1) space", "O(n) time, O(n) space", "O(n²) time, O(1) space", "O(n log n) time, O(1) space"], answer: 1, explain: "Each item is processed once and the set may hold up to n values. O(n log n) with O(1) space describes the sort-in-place alternative.", misconception: "Fast lookup uses auxiliary space proportional to the distinct values." },
        { id: "dup-q3", prompt: "Is this a correct solution?", code: "return len(set(nums)) != len(nums)", options: ["Yes, duplicates make the set smaller than the list", "No, a set keeps duplicates", "No, len() is O(n²)", "Only when nums is sorted"], answer: 0, explain: "A set drops repeats, so its length is smaller than the list exactly when a duplicate exists. It is O(n) time and O(n) space, like the one-pass version.", misconception: "The one-liner is valid; the one-pass version is preferred because it stops early and shows the reusable pattern." },
        { id: "dup-q4", prompt: "In the one-pass version, where does `return False` belong?", options: ["Inside the loop, after the first new value", "After the loop finishes", "Before the loop starts", "Inside the loop, right after seen.add(num)"], answer: 1, explain: "False is only known once every value has been checked. Any return inside the loop should be True.", misconception: "Returning False inside the loop stops the scan after one unique element." }
      ],
      challengeId: "contains-duplicate"
    },
    {
      id: "two-sum",
      number: "1.5",
      title: "Two Sum",
      eyebrow: "Pattern practice",
      duration: 28,
      kind: "coding",
      summary: "Use complement lookup to return a matching pair in one pass.",
      objective: "Translate target − current into a hash-map lookup and return indices.",
      concept: [
        "For each number x, the value needed to reach target is target − x. A dictionary can tell you whether that complement appeared earlier—and where.",
        "Store value → index after checking for its complement. This avoids pairing an item with itself."
      ],
      workedExample: {
        prompt: "Trace nums=[2, 7, 11, 15], target=9.",
        steps: ["At 2, need 7. It is not stored, so save 2 → 0.", "At 7, need 2. Find index 0 in the map.", "Return [0, 1]."],
        takeaway: "The map is a searchable memory of earlier choices."
      },
      misconceptions: [
        { trap: "Store indices as keys.", fix: "Keys are the values so you can look up a complement. Indices are the data you store under them." },
        { trap: "Return the two values instead of indices.", fix: "The problem asks for positions. Return [earlier_index, current_index]." },
        { trap: "Insert before checking and reuse the current element.", fix: "Check for the complement first, then store the current value, so an element never pairs with itself." }
      ],
      questions: [
        { id: "sum-q1", prompt: "At value x, which key do you look up in the dictionary?", options: ["x + target", "target − x", "x − target", "x itself"], answer: 1, explain: "If x + y = target, then y = target − x. That is the value an earlier element must have had.", misconception: "Write the relationship first; the lookup key follows directly." },
        { id: "sum-q2", prompt: "What does the dictionary map in the one-pass solution?", options: ["index → value", "value → its earlier index", "value → target − value", "value → how many times it appeared"], answer: 1, explain: "The key must be the value so a complement can be looked up; the stored index is what the answer has to return.", misconception: "Choose what to store based on what you must produce after the lookup." },
        { id: "sum-q3", prompt: "nums = [3, 3], target = 6. Why does the one-pass solution return [0, 1] instead of pairing index 0 with itself?", options: ["The complement is checked before the current value is stored", "Dictionaries reject duplicate keys", "The loop starts at index 1", "It does pair index 0 with itself"], answer: 0, explain: "At index 0 the dictionary is empty, so nothing matches; 3 → 0 is stored afterwards. At index 1 the lookup finds it.", misconception: "Check first, store second: that order is what prevents self-pairing." },
        { id: "sum-q4", prompt: "What are the time and space costs of the one-pass dictionary solution?", options: ["O(n) time, O(1) space", "O(n) time, O(n) space", "O(n log n) time, O(1) space", "O(n²) time, O(1) space"], answer: 1, explain: "One pass with an average O(1) lookup per element, and the dictionary may hold up to n entries. O(n²)/O(1) is the brute-force pair check.", misconception: "Be ready to name the memory you spent to avoid the nested loop." }
      ],
      challengeId: "two-sum"
    }
  ];

  const challenges = [
    {
      id: "contains-duplicate",
      lessonId: "contains-duplicate",
      title: "Contains Duplicate",
      difficulty: "Easy",
      prompt: "Given a list of integers nums, return True if any value appears at least twice, and False if every element is distinct.",
      signature: "def contains_duplicate(nums):",
      starter: "def contains_duplicate(nums):\n    # Write your solution here\n    pass",
      examples: [
        { input: "[1, 2, 3, 1]", output: "True" },
        { input: "[1, 2, 3, 4]", output: "False" }
      ],
      hints: ["What question must you answer about each value you visit?", "Keep a set of values that have already appeared.", "For each num: check membership, then add it if it is new."],
      checks: [
        { label: "Builds a set with set()", pattern: /\bset\s*\(/ },
        { label: "Returns True or False (or a comparison)", pattern: /return\s+(True|False|len\s*\(|not\s|\w[^\n]*(==|!=|<|>))/ },
        { label: "Checks membership before adding", kind: "order", first: /\bif\b[^\n]*\bin\s+\w+/, second: /\.add\s*\(/ },
        { label: "No nested loops", kind: "no-nested-loops" }
      ],
      solution: "def contains_duplicate(nums):\n    seen = set()\n    for num in nums:\n        if num in seen:\n            return True\n        seen.add(num)\n    return False",
      explanation: "The set holds values from earlier iterations. Each average membership check is O(1), so the full pass is O(n) time with O(n) extra space."
    },
    {
      id: "two-sum",
      lessonId: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      prompt: "Given nums and target, return the indices of two different elements whose values add to target. Assume exactly one answer exists.",
      signature: "def two_sum(nums, target):",
      starter: "def two_sum(nums, target):\n    # Write your solution here\n    pass",
      examples: [
        { input: "nums=[2, 7, 11, 15], target=9", output: "[0, 1]" },
        { input: "nums=[3, 2, 4], target=6", output: "[1, 2]" }
      ],
      hints: ["For a current value x, what other value would complete the target?", "Store earlier values and their indices in a dictionary.", "Check for target - num before writing num into the dictionary."],
      checks: [
        { label: "Creates a dictionary with {} or dict()", pattern: /=\s*(\{\s*\}|dict\s*\(\s*\))/ },
        { label: "Computes the complement target − value", pattern: /target\s*-\s*\w+/ },
        { label: "Looks up the complement before storing the current value", kind: "order", first: /\bif\b[^\n]*\bin\s+\w+/, second: /\w+\s*\[[^\]]+\]\s*=[^=]/ },
        { label: "Returns a list of two indices", pattern: /return\s*\[.+,.+\]/ },
        { label: "No nested loops", kind: "no-nested-loops" }
      ],
      solution: "def two_sum(nums, target):\n    seen = {}\n    for index, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], index]\n        seen[num] = index",
      explanation: "The dictionary maps earlier values to their indices. Looking up each complement is O(1) on average, producing O(n) time and O(n) extra space."
    }
  ];

  window.COURSE_DATA = {
    mastery,
    tracks,
    chapter: {
      id: "foundations",
      number: 1,
      title: "Foundations: Think in Structures",
      description: "Build the complexity and data-structure instincts behind high-frequency interview patterns.",
      trackId: "python",
      lessons
    },
    lessons,
    challenges,
    studyModes: {
      sprint: { id: "sprint", label: "Sprint", minutes: 20, learn: 1, review: 2, practice: 0 },
      steady: { id: "steady", label: "Steady", minutes: 40, learn: 1, review: 3, practice: 1 },
      deep: { id: "deep", label: "Deep", minutes: 70, learn: 2, review: 5, practice: 1 }
    }
  };
})();
