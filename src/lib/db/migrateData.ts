import path from 'path';
import fs from 'fs';
import { importEventsFromFiles } from './events';
import { importBlogsFromFiles } from './blogs';

async function importFileData(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const objectMatch = fileContent.match(/const\s+\w+\s*=\s*({[\s\S]*?});\s*export\s+default/);
    if (!objectMatch || !objectMatch[1]) {
      return null;
    }
    
    const jsonData = objectMatch[1]
      .replace(/(\w+):/g, '"$1":')
      .replace(/\'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1');
    
    try {
      return JSON.parse(jsonData);
    } catch (error) {
      const code = `const data = ${objectMatch[1]}; data;`;
      return eval(code);
    }
  } catch (error) {
    return null;
  }
}

export async function migrateEvents() {
  try {
    const eventsDir = path.join(process.cwd(), 'src', 'data', 'events');
    const files = fs.readdirSync(eventsDir)
      .filter(file => file.endsWith('.ts') && file !== 'index.ts' && file !== 'utils.ts');
    
    const events = [];
    for (const file of files) {
      const filePath = path.join(eventsDir, file);
      const eventData = await importFileData(filePath);
      if (eventData) {
        events.push(eventData);
      }
    }
    
    if (events.length > 0) {
      await importEventsFromFiles(events);
      
      return events.length;
    } else {
      return 0;
    }
  } catch (error) {
    throw error;
  }
}

export async function migrateBlogs() {
  try {
    const blogsDir = path.join(process.cwd(), 'src', 'data', 'blogs');
    
    if (!fs.existsSync(blogsDir)) {
      return 0;
    }
    
    const files = fs.readdirSync(blogsDir)
      .filter(file => file.endsWith('.ts') && file !== 'index.ts' && file !== 'utils.ts');
    
    const blogs = [];
    for (const file of files) {
      const filePath = path.join(blogsDir, file);
      const blogData = await importFileData(filePath);
      if (blogData) {
        blogs.push(blogData);
      }
    }
    
    if (blogs.length > 0) {
      await importBlogsFromFiles(blogs);
      
      return blogs.length;
    } else {
      return 0;
    }
  } catch (error) {
    throw error;
  }
}

export async function migrateAllData() {
  const eventCount = await migrateEvents();
  
  const blogCount = await migrateBlogs();
  
  return { eventCount, blogCount };
}