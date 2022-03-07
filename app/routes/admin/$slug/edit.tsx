import { 
  redirect, 
  Form, 
  ActionFunction, 
  useActionData, 
  useTransition, 
  LoaderFunction, 
  useLoaderData 
} from "remix";
import invariant from "tiny-invariant";
import { updatePost, getPost } from "~/post";

interface PostError {
  markdown?: boolean;
}

export const action: ActionFunction = async ({ request }) => {
  console.log('action----')
  await new Promise((res) => setTimeout(res, 1000));

  const formData = await request.formData();
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: PostError = {};
  if (!markdown) errors.markdown = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof markdown === "string");
  invariant(typeof slug === "string");
  await updatePost(slug, { markdown });

  return redirect(`/admin/${slug}/edit`);
}

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, 'expected params.slug')
  return getPost(params.slug);
};

export default function EditPost() {
  const errors = useActionData();
  const post = useLoaderData();
  const transition = useTransition();

  return (
    <Form method="post">
      <input type="hidden" name="slug" defaultValue={post.slug} />
      <p>
        <label htmlFor="markdown">Markdown:</label>{" "}
        {errors?.markdown ? (
          <em>Markdown is required</em>
        ) : null}
        <br />
        <textarea key={post.slug} id="markdown" rows={20} name="markdown" defaultValue={post.body} />
      </p>
      <p>
        <button type="submit">
          {transition.submission
            ? "Saving..."
            : "Save Post"}
        </button>
      </p>
    </Form>
  );
}