const DND_API_HOST = "https://www.dnd5eapi.co";

const ABILITY_SCORES = [
  ["strength", "STR"],
  ["dexterity", "DEX"],
  ["constitution", "CON"],
  ["intelligence", "INT"],
  ["wisdom", "WIS"],
  ["charisma", "CHA"],
];

const CHALLENGE_RATING_FRACTIONS = {
  0.125: "1/8",
  0.25: "1/4",
  0.5: "1/2",
};

const MONSTER_DERIVED_KEYS = [
  "armor_class",
  "speed",
  "proficiencies",
  "damage_vulnerabilities",
  "damage_resistances",
  "damage_immunities",
  "condition_immunities",
  "senses",
  "hit_points",
  "hit_dice",
  "hit_points_roll",
  "challenge_rating",
  "xp",
  "proficiency_bonus",
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

function formatLabel(key) {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatModifier(score) {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function formatSigned(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function formatDamage(damage) {
  if (!damage) {
    return null;
  }

  const damageType = damage.damage_type?.name;

  if (damage.damage_dice) {
    return damageType ? `${damage.damage_dice} ${damageType}` : damage.damage_dice;
  }

  const scaling = damage.damage_at_slot_level || damage.damage_at_character_level;

  if (scaling) {
    const levels = Object.entries(scaling);
    const [, baseDice] = levels[0];
    const base = damageType ? `${baseDice} ${damageType}` : baseDice;

    return levels.length > 1 ? `${base} (scales with level)` : base;
  }

  return damageType || null;
}

function formatArmorClass(armorClasses) {
  if (!Array.isArray(armorClasses) || armorClasses.length === 0) {
    return null;
  }

  return armorClasses
    .map((ac) => {
      const label = ac.type === "natural" ? "natural armor" : ac.type;
      return label ? `${ac.value} (${label})` : `${ac.value}`;
    })
    .join(", ");
}

function formatSpeed(speed) {
  if (!speed) {
    return null;
  }

  return Object.entries(speed)
    .map(([key, value]) => {
      if (key === "walk") return value;
      if (typeof value === "boolean") return value ? formatLabel(key) : null;
      return `${formatLabel(key)} ${value}`;
    })
    .filter(Boolean)
    .join(", ");
}

function formatProficiencyGroup(proficiencies, prefix) {
  if (!Array.isArray(proficiencies)) {
    return null;
  }

  const matches = proficiencies.filter((entry) =>
    entry.proficiency?.name?.startsWith(prefix)
  );

  if (matches.length === 0) {
    return null;
  }

  return matches
    .map((entry) => {
      const label = entry.proficiency.name.replace(prefix, "").trim();
      return `${label} ${formatSigned(entry.value)}`;
    })
    .join(", ");
}

function formatStringList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }

  return list.map((value) => formatLabel(value)).join(", ");
}

function formatNamedList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }

  return [...new Set(list.map((entry) => entry.name))].join(", ");
}

function formatSenses(senses) {
  if (!senses) {
    return null;
  }

  return Object.entries(senses)
    .map(([key, value]) => `${formatLabel(key)} ${value}`)
    .join(", ");
}

function formatChallenge(challengeRating, xp) {
  if (challengeRating === undefined || challengeRating === null) {
    return null;
  }

  const label = CHALLENGE_RATING_FRACTIONS[challengeRating] ?? String(challengeRating);

  return xp ? `${label} (${xp} XP)` : label;
}

function DndDetailPanel({ detail }) {
  if (!detail) {
    return null;
  }

  const description = detail.desc
    ? [].concat(detail.desc).join(" ")
    : detail.description;

  const isMonster = Array.isArray(detail.armor_class) && detail.hit_points !== undefined;

  const otherFields = Object.entries(detail).filter(
    ([key, value]) =>
      !["index", "name", "desc", "description", "url", "updated_at", "image"].includes(key) &&
      !(isMonster && MONSTER_DERIVED_KEYS.includes(key)) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean") &&
      value !== ""
  );

  const cost = detail.cost
    ? `${detail.cost.quantity} ${detail.cost.unit}`
    : null;

  const properties = Array.isArray(detail.properties)
    ? detail.properties.map((property) => property.name).join(", ")
    : null;

  const abilityScores = ABILITY_SCORES.filter(([key]) => detail[key] !== undefined);

  const derivedFields = [
    ["Cost", cost],
    ["Armor Class", formatArmorClass(detail.armor_class)],
    ["Hit Points", detail.hit_points && `${detail.hit_points} (${detail.hit_dice})`],
    ["Speed", formatSpeed(detail.speed)],
    ["Damage", formatDamage(detail.damage)],
    ["Two-Handed Damage", formatDamage(detail.two_handed_damage)],
    ["Properties", properties],
    ["Saving Throws", formatProficiencyGroup(detail.proficiencies, "Saving Throw: ")],
    ["Skills", formatProficiencyGroup(detail.proficiencies, "Skill: ")],
    ["Damage Vulnerabilities", formatStringList(detail.damage_vulnerabilities)],
    ["Damage Resistances", formatStringList(detail.damage_resistances)],
    ["Damage Immunities", formatStringList(detail.damage_immunities)],
    ["Condition Immunities", formatNamedList(detail.condition_immunities)],
    ["Senses", formatSenses(detail.senses)],
    ["Challenge", formatChallenge(detail.challenge_rating, detail.xp)],
    [
      "Proficiency Bonus",
      detail.proficiency_bonus !== undefined && formatSigned(detail.proficiency_bonus),
    ],
  ].filter(([, value]) => value);

  const traits = Array.isArray(detail.special_abilities) ? detail.special_abilities : [];
  const actions = Array.isArray(detail.actions) ? detail.actions : [];

  return (
    <article className="dnd-detail-panel">
      <h3>{detail.name}</h3>

      {detail.image && (
        <img
          className="dnd-detail-image"
          src={`${DND_API_HOST}${detail.image}`}
          alt={detail.name}
        />
      )}

      {description && <p>{description}</p>}

      {abilityScores.length > 0 && (
        <ul className="dnd-ability-scores">
          {abilityScores.map(([key, label]) => (
            <li key={key}>
              <strong>{label}</strong>
              <span>
                {detail[key]} ({formatModifier(detail[key])})
              </span>
            </li>
          ))}
        </ul>
      )}

      {(derivedFields.length > 0 || otherFields.length > 0) && (
        <ul className="dnd-detail-fields">
          {derivedFields.map(([label, value]) => (
            <li key={label}>
              <strong>{label}:</strong> {value}
            </li>
          ))}

          {otherFields.map(([key, value]) => (
            <li key={key}>
              <strong>{formatLabel(key)}:</strong> {String(value)}
            </li>
          ))}
        </ul>
      )}

      {traits.length > 0 && (
        <>
          <h4>Traits</h4>

          <ul className="dnd-detail-actions">
            {traits.map((trait) => (
              <li key={trait.name}>
                <strong>{trait.name}.</strong> {trait.desc}
              </li>
            ))}
          </ul>
        </>
      )}

      {actions.length > 0 && (
        <>
          <h4>Actions</h4>

          <ul className="dnd-detail-actions">
            {actions.map((action) => (
              <li key={action.name}>
                <strong>{action.name}.</strong> {action.desc}
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

export default DndDetailPanel;
