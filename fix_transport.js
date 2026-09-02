const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/TransportModification.tsx', 'utf8');

content = content.replace("{isIntercity 'Intercity", "{isIntercity ? 'Intercity");
content = content.replace("loading 'animate", "loading ? 'animate");
content = content.replace("isSelected\n 'border", "isSelected\n ? 'border");
content = content.replace("isSelected\r\n 'border", "isSelected\r\n ? 'border");
// some environments might have spaces instead of newlines, handle it robustly:
content = content.replace(/isSelected\s+'border/g, "isSelected ? 'border");
content = content.replace("Badge variant={opt.accessible 'feasible' : 'danger'}", "Badge variant={opt.accessible ? 'feasible' : 'danger'}");
content = content.replace("{opt.accessible 'o\" 100% Accessible' : 'Limited Access'}", "{opt.accessible ? '100% Accessible' : 'Limited Access'}");
content = content.replace("{opt.accessible '100% Accessible' : 'Limited Access'}", "{opt.accessible ? '100% Accessible' : 'Limited Access'}");
content = content.replace(/{opt.availableWheelchairBays > 0 .*?\$\{opt.availableWheelchairBays\} Open : 'None'}/, "{opt.availableWheelchairBays > 0 ? ${opt.availableWheelchairBays} Open : 'None'}");
content = content.replace(/{selectedOpt.type === 'cab' 'Book on Uber Assist .*?' : 'Confirm & Proceed'}/, "{selectedOpt?.type === 'cab' ? 'Book on Uber Assist' : 'Confirm & Proceed'}");

content = content.replace(/\+''/, "'");
content = content.replace(/-/, "");
content = content.replace(/,1/, "?"); // Fix rupees
content = content.replace(/z"/, "->"); // Fix arrow

fs.writeFileSync('src/ui-pages/TransportModification.tsx', content);
