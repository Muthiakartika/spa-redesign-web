import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePost from "@/components/sections/GuidePost";
import PageTitle from "@/components/sections/PageTitle";
import JsonLd from "@/components/seo/JsonLd";
import GuideAnswer from "@/components/sections/GuideAnswer";
import { guideAnswers } from "@/data/guide/answers";
import { getGuideArticle, getPublishedPost, getPublishedPosts } from "@/lib/blog/posts";
import { sanitizeHtml } from "@/lib/blog/sanitize";
import { articleSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// Built once and kept until an article is saved in /admin/ (which rebuilds
// every article page); articles published later are rendered on their first
// visit. A database error is thrown on purpose: Next then keeps serving the
// last good page instead of caching an error or a false 404.
export const revalidate = false;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || "",
    path: `/guide/${post.slug}/`,
    type: "article",
    shareImage: post.cover_image ?? undefined,
  });
}

/** A guide article (the live "blog-details" page), from the database. */
export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getGuideArticle(slug);
  if (!article) notFound();
  const { post, recentPosts, prevPost, nextPost, morePosts } = article;
  // Two sentences naming the spa, with the price and the treatment page (AEO roadmap, 17 Oct).
  const answer = guideAnswers[post.slug];

  return (
    <div className={`page-wrapper lh p-guide-${post.slug}`}>
      <JsonLd
        data={articleSchema({
          slug: post.slug,
          title: post.title,
          description: post.seo_description || post.excerpt,
          image: post.cover_image,
          author: post.author,
          publishedAt: post.published_at,
          updatedAt: post.updated_at,
        })}
      />
      <PageTitle pageName={post.title} backgroundImage={post.cover_image ?? undefined} />
      <GuidePost
        post={{ ...post, content_html: sanitizeHtml(post.content_html) }}
        recentPosts={recentPosts}
        prevPost={prevPost}
        nextPost={nextPost}
        morePosts={morePosts}
        answer={answer ? <GuideAnswer text={answer} /> : undefined}
      />
    </div>
  );
}
