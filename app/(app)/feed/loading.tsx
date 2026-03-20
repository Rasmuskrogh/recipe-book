import skeleton from "@/components/ui/SkeletonPulse.module.css";

export default function Loading() {
  return (
    <div className={skeleton.page} aria-hidden>
      <div className={skeleton.header}>
        <div className={`${skeleton.skeleton} ${skeleton.titleBlock}`} />
        <div className={`${skeleton.skeleton} ${skeleton.buttonBlock}`} />
      </div>

      <div className={skeleton.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={skeleton.card}>
            <div className={`${skeleton.skeleton} ${skeleton.imageBlock}`} />
            <div className={`${skeleton.skeleton} ${skeleton.lineBlockLg}`} />
            <div className={`${skeleton.skeleton} ${skeleton.lineBlockSm}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

