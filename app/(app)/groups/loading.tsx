import skeleton from "@/components/ui/SkeletonPulse.module.css";

export default function Loading() {
  return (
    <div className={skeleton.page} aria-hidden>
      <div className={skeleton.header}>
        <div className={`${skeleton.skeleton} ${skeleton.titleBlock}`} />
        <div className={`${skeleton.skeleton} ${skeleton.buttonBlock}`} />
      </div>

      <div className={skeleton.list}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={skeleton.listItem}>
            <div
              className={`${skeleton.skeleton} ${skeleton.avatarBlock}`}
            />
            <div className={skeleton.textStack}>
              <div
                className={`${skeleton.skeleton} ${skeleton.lineBlockRow1}`}
              />
              <div
                className={`${skeleton.skeleton} ${skeleton.lineBlockRow2}`}
              />
            </div>
            <div className={`${skeleton.skeleton} ${skeleton.sectionTitleBlock}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

