import { Link, useLoaderData, LoaderFunction, LinksFunction, Outlet } from "remix";
import { getPosts, Post } from "~/post";
import adminStyles from '~/styles/admin.css'

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: adminStyles
    }
  ]
}

export const loader: LoaderFunction = async () => {
  return getPosts()
}

export default function Admin() {
  const posts = useLoaderData<Post[]>()
  return (
    <div className="admin">
      <nav>
        <h1>Admin</h1>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/posts/${post.slug}`}>
                {post.title}
              </Link>
              {' '}
              <Link to={`${post.slug}/edit`}>
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}