import Link from "next/link";
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

export function ProfileRecipeGrid({ recipes, username }: ProfileRecipeGridProps) {
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
              <img src={recipe.imageUrl} alt="" className={styles.image} />
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
