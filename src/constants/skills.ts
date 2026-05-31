/** Популярные навыки (теги) */
export const POPULAR_SKILLS: string[] = [
  // Frontend
  'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript',
  'HTML', 'CSS', 'Tailwind CSS', 'SASS/SCSS', 'Redux', 'GraphQL',
  
  // Backend
  'Node.js', 'NestJS', 'Express', 'Python', 'Django', 'FastAPI',
  'PHP', 'Laravel', 'Go', 'Rust', 'Java', 'Spring Boot',
  'C#', '.NET', 'Ruby on Rails',
  
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android',
  
  // Database
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Supabase', 'Firebase',
  
  // DevOps
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD',
  'Terraform', 'Nginx', 'Linux',
  
  // Design
  'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Sketch',
  'UI Design', 'UX Design', 'Prototyping', 'Wireframing',
  
  // Other
  'Git', 'REST API', 'WebSocket', 'Microservices',
  'Agile/Scrum', 'Unit Testing', 'SEO', 'WordPress',
];

/** Навыки по категориям */
export const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  'web-development': [
    'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript',
    'Node.js', 'NestJS', 'Express', 'PHP', 'Laravel', 'Python', 'Django',
    'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
  ],
  'mobile-development': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android',
    'Firebase', 'TypeScript',
  ],
  design: [
    'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Sketch',
    'UI Design', 'UX Design', 'Prototyping', 'Wireframing',
    'Motion Design', 'Branding',
  ],
  devops: [
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD',
    'Terraform', 'Nginx', 'Linux', 'Monitoring',
  ],
  qa: [
    'Unit Testing', 'E2E Testing', 'Selenium', 'Cypress',
    'Jest', 'Playwright', 'Performance Testing',
  ],
  marketing: [
    'SEO', 'Google Ads', 'Facebook Ads', 'SMM',
    'Content Marketing', 'Email Marketing', 'Analytics',
  ],
};
