import Link from "next/link";
import Image from "next/image";
import styles from "./ProfileRecipeGrid.module.css";

export interface RecipeItem {
  id: string;
  title: string;
  imageUrl?: string | null;
}

export interface ProfileRecipeGridProps {
  recipes: RecipeItem[];
  username: string;
}

export function ProfileRecipeGrid({ recipes }: ProfileRecipeGridProps) {
  if (recipes.length === 0) {
    return <p className={styles.empty}>Inga publika recept än.</p>;
  }
  return (
    <div className={styles.profileRecipeGrid}>
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          href={`/recipes/${recipe.id}`}
          className={styles.card}
        >
          <div className={styles.imageWrap}>
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt=""
                fill
                className={styles.image}
                sizes="(max-width: 640px) 50vw, 10rem"
              />
            ) : (
              <div className={styles.placeholder} />
            )}
          </div>
          <span className={styles.title}>{recipe.title}</span>
        </Link>
      ))}
    </div>
  );
}
