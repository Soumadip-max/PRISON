import json, urllib.request, sys

def post(url, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read())

def test(label, target_url):
    print(f"\nTEST: {label}")
    data = post("http://localhost:8000/api/v1/detonate", {"url": target_url})
    sev   = data.get("severity", "?")
    stat  = data.get("status", "?")
    patch = bool(data.get("patch_diff"))
    nodes = len(data.get("nodes", []))
    for l in data.get("terminal_logs", [])[:4]:
        print(f"  log: {l.get('msg','')[:80]}")
    print(f"  --> status={stat}  severity={sev}  patch_present={patch}  nodes={nodes}")
    return data

d1 = test("Clean public PR (f/prompts.chat#1273)", "https://github.com/f/prompts.chat/pull/1273")
d2 = test("Malicious local demo repo", r"C:\Users\Admin\Desktop\PRISON\demo-repos\scenario-b-malicious")

print("\n=== FINAL VERDICT ===")
r1_sev   = d1["severity"] == 0
r1_patch = not bool(d1["patch_diff"])
r1_stat  = d1.get("status") == "SAFE"
r2_sev   = d2["severity"] > 0
r2_patch = bool(d2["patch_diff"])

print(f"  clean PR severity=0       : {'PASS' if r1_sev   else 'FAIL'} (got {d1['severity']})")
print(f"  clean PR status=SAFE      : {'PASS' if r1_stat  else 'FAIL'} (got {d1.get('status')})")
print(f"  clean PR no patch         : {'PASS' if r1_patch else 'FAIL'} (patch_diff={bool(d1['patch_diff'])})")
print(f"  malicious severity>0      : {'PASS' if r2_sev   else 'FAIL'} (got {d2['severity']})")
print(f"  malicious patch generated : {'PASS' if r2_patch else 'FAIL'} (patch_diff={bool(d2['patch_diff'])})")
all_pass = all([r1_sev, r1_patch, r1_stat, r2_sev, r2_patch])
print(f"\n  OVERALL: {'ALL PASS' if all_pass else 'SOME FAILURES'}")
sys.exit(0 if all_pass else 1)
