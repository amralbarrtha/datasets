import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; // Import relations

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
    datasets: many(datasets),
    voiceSamples: many(voiceSamples),
}));

export const datasets = pgTable("datasets", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    userId: uuid("user_id").references(() => users.id), // Link to creator
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const datasetsRelations = relations(datasets, ({ one, many }) => ({
    user: one(users, {
        fields: [datasets.userId],
        references: [users.id],
    }),
    voiceSamples: many(voiceSamples),
}));

export const voiceSamples = pgTable("voice_samples", {
    id: uuid("id").primaryKey().defaultRandom(),
    text: text("text").notNull(),
    audioPath: text("audio_path").notNull(),
    datasetId: uuid("dataset_id")
        .notNull()
        .references(() => datasets.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id), // Link to uploader
    originalFileName: text("original_file_name"), // Store original filename
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const voiceSamplesRelations = relations(voiceSamples, ({ one }) => ({
    dataset: one(datasets, {
        fields: [voiceSamples.datasetId],
        references: [datasets.id],
    }),
    user: one(users, {
        fields: [voiceSamples.userId],
        references: [users.id],
    }),
}));
