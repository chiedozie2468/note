const fs = require('fs');
const content = fs.readFileSync('components/Editor.tsx', 'utf8');

let updated = content.replace(
  /import React, \{ useEffect, useState \} from \ react\;/,
  'import React, { useEffect, useState, useMemo } from \react\;'
);

updated = updated.replace(
  /const userInfo = useSelf\(\(me\) => me\.info\);\r?\n\r?\n  const editor = useCreateBlockNote\(\{/,
  const userInfo = useSelf((me) => me.info);

  const user = useMemo(() => ({
    name: userInfo?.name ?? \Anonymous\,
    color: stringToColor(userInfo?.email ?? \anonymous@example.com\),
  }), [userInfo?.name, userInfo?.email]);

  const editor = useCreateBlockNote({
);

updated = updated.replace(
  /user: \{\r?\n        name: userInfo\?\.name \?\? \Anonymous\,\r?\n        color: stringToColor\(userInfo\?\.email \?\? \anonymous@example\.com\\),\r?\n      \},/,
  'user,'
);

fs.writeFileSync('components/Editor.tsx', updated);
console.log('Done');
