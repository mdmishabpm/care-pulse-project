import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const dir = path.resolve('.');

async function main() {
  const args = process.argv.slice(2);
  const repoUrl = args[0] || 'https://github.com/mdmishabpm/care-pulse-project.git';
  const token = args[1];

  if (!token) {
    console.error("Usage: node push_to_github.js <REPO_URL> <TOKEN>");
    process.exit(1);
  }

  console.log("📦 Initializing fresh, clean Git repository...");
  await git.init({ fs, dir, defaultBranch: 'main' });

  // Get all project files
  function getFiles(currentDir, base = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (['node_modules', '.git', 'dist'].includes(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      const relPath = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath, relPath));
      } else {
        files.push(relPath);
      }
    }
    return files;
  }

  const filesToAdd = getFiles(dir);
  console.log(`📄 Adding ${filesToAdd.length} clean project files...`);
  for (const filepath of filesToAdd) {
    await git.add({ fs, dir, filepath });
  }

  console.log("💾 Creating clean initial commit...");
  const sha = await git.commit({
    fs,
    dir,
    author: { name: 'mdmishabpm', email: 'dev@carepulse.app' },
    message: 'feat: CarePulse - Production-Grade Hackathon Winning Companion'
  });
  console.log(`✅ Commit created: ${sha}`);

  console.log(`📡 Setting remote origin to ${repoUrl}...`);
  try {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
  } catch {}
  await git.addRemote({ fs, dir, remote: 'origin', url: repoUrl });

  console.log(`🚀 Pushing main branch to GitHub...`);
  await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({ username: token, password: '' })
  });

  console.log("🎉 SUCCESS! Pushed to GitHub successfully!");
}

main().catch(err => {
  console.error("\n❌ Push error:", err.message);
  process.exit(1);
});
