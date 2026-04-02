export interface StarterSong {
  file: string;
  title: string;
  composer: string;
  level: 1 | 2 | 3 | 4;
  levelLabel: string;
  description: string;
}

export const STARTER_SONGS: StarterSong[] = [
  {
    file: "mary-had-a-little-lamb.mid",
    title: "Mary Had a Little Lamb",
    composer: "Traditional",
    level: 1,
    levelLabel: "Beginner",
    description: "4 notes, simple melody. Great first song.",
  },
  {
    file: "twinkle-twinkle.mid",
    title: "Twinkle Twinkle Little Star",
    composer: "Traditional",
    level: 1,
    levelLabel: "Beginner",
    description: "6 notes in C major. Universally recognized.",
  },
  {
    file: "ode-to-joy.mid",
    title: "Ode to Joy",
    composer: "Beethoven",
    level: 2,
    levelLabel: "Easy",
    description: "Stepwise melody with simple bass. Two hands.",
  },
  {
    file: "amazing-grace.mid",
    title: "Amazing Grace",
    composer: "John Newton",
    level: 2,
    levelLabel: "Easy",
    description: "Beautiful slow melody in 3/4 time.",
  },
  {
    file: "minuet-in-g.mid",
    title: "Minuet in G Major",
    composer: "Petzold (Bach Notebook)",
    level: 3,
    levelLabel: "Intermediate",
    description: "Classic beginner piano piece. Two-voice texture.",
  },
  {
    file: "canon-in-d.mid",
    title: "Canon in D",
    composer: "Pachelbel",
    level: 3,
    levelLabel: "Intermediate",
    description: "Famous 8-chord progression. Builds complexity.",
  },
  {
    file: "fur-elise.mid",
    title: "Fur Elise",
    composer: "Beethoven",
    level: 4,
    levelLabel: "Advanced",
    description: "The iconic piano piece. A real achievement.",
  },
  {
    file: "the-entertainer.mid",
    title: "The Entertainer",
    composer: "Scott Joplin",
    level: 4,
    levelLabel: "Advanced",
    description: "Classic ragtime. Syncopated rhythms.",
  },
];
