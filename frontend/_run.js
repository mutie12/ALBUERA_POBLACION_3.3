import { execSync } from 'child_process';
import fs from 'fs';

const nodeExe = 'C:\\Program Files\\nodejs\\node.exe';
const viteBin = 'C:\\Users\\svlom\\OneDrive\\Desktop\\ALBUERA_POBLACION_3\\frontend\\node_modules\\.bin\\vite.cmd';

fs.writeFileSync('C:\\Users\\svlom\\OneDrive\\Desktop\\ALBUERA_POBLACION_3\\frontend\\_result.txt', 'using absolute paths\n');
execSync(`"${nodeExe}" "${viteBin}" build --force`, { encoding:'utf8', timeout:300000, maxBuffer:50*1024*1024, windowsHide:true });
