/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  images: {
    unoptimized: true,
  },
  // Old web addresses (links in emails, bookmarks, Google) still work after the rename:
  // Services -> Sessions, Online Learning (/learn) -> Courses. Old /courses/<slug> class
  // links are forwarded to /classes by the course pages themselves.
  async redirects() {
    return [
      // The old long "detailed" page became one page per session (/sessions/<service>).
      { source: "/services/detailed", destination: "/sessions", permanent: true },
      { source: "/sessions/detailed", destination: "/sessions", permanent: true },
      { source: "/services", destination: "/sessions", permanent: true },
      { source: "/services/:path*", destination: "/sessions/:path*", permanent: true },
      { source: "/learn", destination: "/courses", permanent: true },
      { source: "/learn/:path*", destination: "/courses/:path*", permanent: true },
      { source: "/portal/learning", destination: "/portal/courses", permanent: true },
      { source: "/portal/learning/:path*", destination: "/portal/courses/:path*", permanent: true },
      { source: "/admin/learning", destination: "/admin/courses", permanent: true },
      { source: "/admin/learning/:path*", destination: "/admin/courses/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
