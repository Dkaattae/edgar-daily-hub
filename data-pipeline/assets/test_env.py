""" @bruin
name: test_env
type: python
depends: []
@bruin """

import os
import sys
import json

print(f"Template run_date: '{{{{ ds }}}}'")
print(f"Argv: {sys.argv}")
print("ENV VARS:")
for k, v in os.environ.items():
    if "BRUIN" in k:
        print(f"{k}={v}")
