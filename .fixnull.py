import os
paths = [
    'src/lib/supabase/server.ts',
    'src/middleware.ts',
    'src/lib/supabase/admin.ts',
    'src/lib/supabase/client.ts',
]
for p in paths:
    with open(p, 'rb') as f:
        d = f.read()
    d2 = d.rstrip(b'\x00')
    if len(d) != len(d2):
        with open(p, 'wb') as f:
            f.write(d2)
        print('fixed', p, len(d), '->', len(d2))
    else:
        print('ok', p, len(d))
