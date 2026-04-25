USE fuxiaochen;

INSERT INTO Blog (id, createdAt, updatedAt, title, slug, description, content, published, categoryId) VALUES
('b01', NOW(), NOW(), 'React Hooks Deep Dive', 'react-hooks-deep-dive', 'A comprehensive guide to React Hooks', 'Full content about React Hooks...', true, 'cat1'),
('b02', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'TypeScript Best Practices', 'typescript-best-practices', 'Learn TypeScript best practices', 'Full content about TypeScript...', true, 'cat1'),
('b03', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Building REST APIs with Node.js', 'building-rest-apis-nodejs', 'Build REST APIs using Express', 'Full content about Node.js APIs...', true, 'cat2'),
('b04', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 'Docker for Beginners', 'docker-for-beginners', 'Getting started with Docker', 'Full content about Docker...', true, 'cat3'),
('b05', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 'Python Web Scraping', 'python-web-scraping', 'Web scraping with Python', 'Full content about Python scraping...', true, 'cat2'),
('b06', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 'React State Management', 'react-state-management', 'Redux vs Zustand vs Jotai', 'Full content about state management...', true, 'cat1'),
('b07', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), 'CI CD with GitHub Actions', 'cicd-github-actions', 'Automate deployment pipeline', 'Full content about CI CD...', true, 'cat3'),
('b08', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), 'GraphQL vs REST', 'graphql-vs-rest', 'Comparing GraphQL and REST', 'Full content about GraphQL vs REST...', true, 'cat2'),
('b09', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 'Kubernetes Basics', 'kubernetes-basics', 'Intro to Kubernetes orchestration', 'Full content about Kubernetes...', true, 'cat3'),
('b10', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), 'Next.js App Router', 'nextjs-app-router', 'Migrating to App Router', 'Full content about Next.js...', true, 'cat1'),
('b11', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 'Database Optimization', 'database-optimization', 'SQL query optimization tips', 'Full content about DB optimization...', true, 'cat2'),
('b12', DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), 'React Server Components', 'react-server-components', 'Understanding RSC benefits', 'Full content about RSC...', true, 'cat1'),
('b13', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), 'Nginx Configuration', 'nginx-configuration', 'Nginx reverse proxy guide', 'Full content about Nginx...', true, 'cat3'),
('b14', DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), 'TypeScript Generics', 'typescript-generics', 'Master TS generics', 'Full content about TS generics...', true, 'cat1'),
('b15', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 'Microservices Architecture', 'microservices-architecture', 'Scalable microservices design', 'Full content about microservices...', true, 'cat2');

INSERT INTO BlogTag (blogId, tagId) VALUES
('b01', 'tag1'), ('b01', 'tag2'),
('b02', 'tag2'),
('b03', 'tag4'),
('b04', 'tag3'),
('b05', 'tag5'),
('b06', 'tag1'),
('b07', 'tag3'),
('b08', 'tag4'),
('b09', 'tag3'),
('b10', 'tag1'), ('b10', 'tag2'),
('b11', 'tag5'),
('b12', 'tag1'),
('b13', 'tag3'),
('b14', 'tag2'),
('b15', 'tag4');
