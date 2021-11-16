import knex from "knex";
import { DatabaseTable, Foreigns, References } from "./constants.js";

export const database = knex({
	client: "sqlite3",
	connection: {
		filename: "database.db",
	},
	debug: true,
	useNullAsDefault: true,
});

/**
 * @type { Record<string, import("../global").tableBuilder> }
 */
export const tablemap = {
	[DatabaseTable.User]: (table) => {
		table.increments("id").primary();
		table.string("username");
		table.integer("created_at");
		table.string("email");
		table.string("phone");
		table.string("password");
		table.string("slogan");
		table.string("avatar");
		table.string("address");
		table.string("concat");
	},

	[DatabaseTable.Timeline]: (table) => {
		table.increments("id").primary();
		table.string("line").unique();
	},

	[DatabaseTable.Tag]: (table) => {
		table.increments("id").primary();
		table.string("name").unique();
		table.string("color");
		table.string("back_color");
	},

	[DatabaseTable.Category]: (table) => {
		table.increments("id").primary();
		table.string("type").unique();
	},

	[DatabaseTable.Article]: (table) => {
		table.increments("id").primary();
		table.string("title").unique().notNullable();
		table.text("content");
		table.text("resource");
		table.text("excerpt");
		table.integer("created_at");
		table.integer("updated_at");
		table.integer("status").notNullable();
	},

	[DatabaseTable.ArticleTag]: (table) => {
		table.increments("id").primary();
		table.integer(Foreigns.article).notNullable();
		table.foreign(Foreigns.article).references(References.article);
		table.integer(Foreigns.tag).notNullable();
		table.foreign(Foreigns.tag).references(References.tag);
	},

	[DatabaseTable.ArticleCategory]: (table) => {
		table.increments("id").primary();
		table.integer(Foreigns.article).notNullable();
		table.foreign(Foreigns.article).references(References.article);
		table.integer(Foreigns.category).notNullable();
		table.foreign(Foreigns.category).references(References.category);
	},

	[DatabaseTable.ArticleTimeline]: (table) => {
		table.increments("id").primary();
		table.integer(Foreigns.timeline).notNullable();
		table.foreign(Foreigns.timeline).references(References.timeline);
		table.integer(Foreigns.article).notNullable();
		table.foreign(Foreigns.article).references(References.article);
	},

	[DatabaseTable.UserArticle]: (table) => {
		table.increments("id").primary();
		table.integer(Foreigns.article).notNullable();
		table.foreign(Foreigns.article).references(References.article);
		table.integer(Foreigns.user);
		table.foreign(Foreigns.user).references(References.user);
	},
};

export async function bootstrapTables(force) {
	const tablenames = Object.keys(tablemap);
	if (force) {
		await Promise.all(tablenames.map((table) => database.schema.dropTable(table).catch(() => {})));
		await Promise.all(tablenames.map((table) => database.schema.createTable(table)));
		return;
	}

	for (const tablename of tablenames) {
		const existed = await database.schema.hasTable(tablename);
		if (!existed) {
			await database.schema.createTable(tablename, tablemap[tablename]);
		}
	}
}