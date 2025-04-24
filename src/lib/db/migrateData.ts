import path from 'path';
import fs from 'fs';
import { importEventsFromFiles } from './events';
import { importBlogsFromFiles } from './blogs';

// Helper to read and parse JavaScript/TypeScript files
async function importFileData(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }
    
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the exported object using regex
    const objectMatch = fileContent.match(/const\s+\w+\s*=\s*({[\s\S]*?});\s*export\s+default/);
    if (!objectMatch || !objectMatch[1]) {
      console.error(`Failed to extract data from ${filePath}`);
      return null;
    }
    
    // Convert to valid JSON format by replacing single quotes with double quotes
    const jsonData = objectMatch[1]
      .replace(/(\w+):/g, '"$1":')  // Add quotes to keys
      .replace(/'/g, '"')           // Replace single quotes with double quotes
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    // Parse JSON
    try {
      return JSON.parse(jsonData);
    } catch (error) {
      console.error(`Failed to parse JSON from ${filePath}:`, error);
      // Fallback: use eval (less safe but more tolerant of JS syntax)
      const code = `const data = ${objectMatch[1]}; data;`;
      return eval(code);
    }
  } catch (error) {
    console.error(`Error importing file ${filePath}:`, error);
    return null;
  }
}

// Import all events from files
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
      console.log(`Successfully migrated ${events.length} events to MongoDB`);
      return events.length;
    } else {
      console.warn('No events found to migrate');
      return 0;
    }
  } catch (error) {
    console.error('Error migrating events:', error);
    throw error;
  }
}

// Import all blogs from files
export async function migrateBlogs() {
  try {
    const blogsDir = path.join(process.cwd(), 'src', 'data', 'blogs');
    
    // Check if directory exists
    if (!fs.existsSync(blogsDir)) {
      console.warn('Blogs directory not found:', blogsDir);
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
      console.log(`Successfully migrated ${blogs.length} blogs to MongoDB`);
      return blogs.length;
    } else {
      console.warn('No blogs found to migrate');
      return 0;
    }
  } catch (error) {
    console.error('Error migrating blogs:', error);
    throw error;
  }
}

// Main migration function
export async function migrateAllData() {
  console.log('Starting migration of data to MongoDB...');
  
  const eventCount = await migrateEvents();
  console.log(`Migrated ${eventCount} events`);
  
  const blogCount = await migrateBlogs();
  console.log(`Migrated ${blogCount} blogs`);
  
  console.log('Data migration complete!');
  return { eventCount, blogCount };
}