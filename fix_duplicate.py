content = open('app/student-dashboard/page.tsx', encoding='utf-8').read()

# Count occurrences
count = content.count('onClick={() => router.push("/session-history")}')
print(f"Found {count} occurrences")

# Find and remove the first duplicate (the one at line ~1391)
old = '         <Button\n            variant="ghost"\n            className="flex flex-col items-center gap-1 h-auto py-2"\n            onClick={() => router.push("/session-history")}\n          >\n            <TrendingUp size={20} />\n            <span className="text-xs">History</span>\n          </Button>\n\n          <Button\n            variant="ghost"\n            className="flex flex-col items-center gap-1 h-auto py-2"\n            onClick={() => setShowLearningOptions(true)}'

new = '          <Button\n            variant="ghost"\n            className="flex flex-col items-center gap-1 h-auto py-2"\n            onClick={() => setShowLearningOptions(true)'

result = content.replace(old, new, 1)

if result != content:
    open('app/student-dashboard/page.tsx', 'w', encoding='utf-8').write(result)
    print("Fixed!")
else:
    print("Pattern not found")