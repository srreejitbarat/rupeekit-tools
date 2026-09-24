import fs from 'node:fs';

// Windows file watchers can briefly hold a file without write sharing. Avoid
// rewriting unchanged files and retry that transient lock a bounded number of times.
export function writeUtf8(file, contents) {
  if(fs.existsSync(file)&&fs.readFileSync(file,'utf8')===contents)return;
  for(let attempt=0;;attempt++) {
    try {fs.writeFileSync(file,contents,'utf8');return;}
    catch(error) {
      if(attempt>=5||!['UNKNOWN','EBUSY','EPERM','EACCES'].includes(error.code))throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,200);
    }
  }
}
