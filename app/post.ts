import path from 'path'
import fs from 'fs/promises'
import parseFrontMatter from 'front-matter'
import invariant from 'tiny-invariant';
import { marked } from "marked";

export interface Post {
  slug: string;
  title: string;
  markdown?: string;
  html?: string;
  body?: string;
}

interface NewPost {
  slug: string;
  title: string;
  markdown: string;
}

interface UpdatedPost {
  markdown: string;
}

interface PostMarkdownAttributes {
  title: string;
}

const postsPath = path.join(__dirname, '../posts')

function isValidPostAttributes(attributes: any): attributes is PostMarkdownAttributes {
  return attributes?.title
}

export async function getPosts(): Promise<Post[]> {
  const dir = await fs.readdir(postsPath)
  return Promise.all(
    dir.map(async (fileName) => {
      const file = await fs.readFile(path.join(postsPath, fileName))
      const { attributes } = parseFrontMatter(file.toString())
      invariant(isValidPostAttributes(attributes), `${fileName} has a bad meta data!`)

      return {
        slug: fileName.replace(/\.md$/, ''),
        title: attributes.title,
      }
    })
  )
}

export async function getPost(slug: string): Promise<Post> {
  const filePath = path.join(postsPath, `${slug}.md`)
  const file = await fs.readFile(filePath)
  const { attributes, body } = parseFrontMatter(file.toString())
  invariant(isValidPostAttributes(attributes), `Post ${filePath} is missing attributes!`)
  const html = marked(body)
  return {
    html,
    slug,
    title: attributes.title,
    body
  }
}

export async function createPost(post: NewPost): Promise<Post> {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  await fs.writeFile(
    path.join(postsPath, post.slug + ".md"),
    md
  );
  return getPost(post.slug);
}

export async function updatePost(slug: string, post: UpdatedPost): Promise<Post> {
  const filePath = path.join(postsPath, `${slug}.md`)
  const file = await fs.readFile(filePath)
  const { attributes } = parseFrontMatter(file.toString())
  invariant(isValidPostAttributes(attributes), `Post ${filePath} is missing attributes!`)

  const md = `---\ntitle: ${attributes.title}\n---\n\n${post.markdown}`;
  
  await fs.writeFile(
    path.join(postsPath, slug + ".md"),
    md
  );
  return getPost(slug);
}
