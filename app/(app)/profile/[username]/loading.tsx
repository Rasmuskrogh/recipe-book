import skeleton from "@/components/ui/SkeletonPulse.module.css";

export default function Loading() {
  return (
    <div className={skeleton.page} aria-hidden>
      <div className={skeleton.listItem}>
        <div className={`${skeleton.skeleton} ${skeleton.avatarBlock}`} />
        <div className={skeleton.textStack}>
          <div className={`${skeleton.skeleton} ${skeleton.lineBlockRow1}`} />
          <div className={`${skeleton.skeleton} ${skeleton.lineBlockRow2}`} />
          <div className={`${skeleton.skeleton} ${skeleton.lineBlockRow1}`} />
        </div>
      </div>

      <div className={skeleton.tabsRow}>
        <div className={`${skeleton.skeleton} ${skeleton.buttonBlock}`} />
        <div className={`${skeleton.skeleton} ${skeleton.buttonBlock}`} />
      </div>

      <div className={`${skeleton.skeleton} ${skeleton.sectionTitleBlock}`} />

      <div className={skeleton.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={skeleton.card}>
            <div className={`${skeleton.skeleton} ${skeleton.imageBlock}`} />
            <div className={`${skeleton.skeleton} ${skeleton.lineBlockLg}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

