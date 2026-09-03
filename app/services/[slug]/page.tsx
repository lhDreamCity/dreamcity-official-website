import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServiceBySlug } from "@/app/lib/services";

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const service = getServiceBySlug(slug);
    return {
      title: service ? `${service.title} - 梦之城AI赋能中心` : "业务详情 - 梦之城AI赋能中心",
      description: service?.description,
    };
  });
}

export function generateStaticParams() {
  return ["opc", "ecommerce", "social-media"].map((slug) => ({ slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-20 text-white">
        <div className="container-page">
          <span className="section-tag !text-gold-bright">Business</span>
          <h1 className="text-4xl font-bold">{service.title}</h1>
          <p className="mt-3 text-lg text-white/70">{service.description}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Image
            src={service.banner}
            alt={service.title}
            width={900}
            height={500}
            className="mx-auto mb-10 max-w-[900px] rounded-2xl border border-line shadow-sm"
            loading="lazy"
          />
          <div className="card mx-auto max-w-[820px] p-10">
            <p className="text-[16px] leading-relaxed text-ink">{service.body}</p>
          </div>
          <div className="mt-10 text-center">
            <Link href="/contact" className="btn btn-gold">
              咨询该服务
            </Link>
            <Link href="/services" className="btn btn-ghost ml-3">
              返回业务中心
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
