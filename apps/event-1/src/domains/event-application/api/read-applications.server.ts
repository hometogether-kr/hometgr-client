import "server-only";

import { z } from "zod";

import { getEventDatabase } from "@/shared/api/database.server";

import { applicationListSchema } from "../model/application.schema";

const countRowsSchema = z.array(z.object({ total: z.number().int().nonnegative() })).length(1);
const pageSize = 50;

export async function listEventApplications(requestedPage: number) {
  const client = await getEventDatabase().connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const count = await client.query(
      "SELECT COUNT(*)::int AS total FROM event_1.event_applications",
    );
    const total = countRowsSchema.parse(count.rows)[0].total;
    const page = Math.min(requestedPage, Math.max(1, Math.ceil(total / pageSize)));
    const result = await client.query<Record<string, unknown>>(
      `SELECT id, university_campus AS "universityCampus", phone, email,
        move_in_year, move_in_month, move_in_period
      FROM event_1.event_applications ORDER BY created_at DESC, id ASC LIMIT $1 OFFSET $2`,
      [pageSize, (page - 1) * pageSize],
    );
    const items = result.rows.map((row) => ({
      ...row,
      moveInTiming:
        row.move_in_year === null
          ? null
          : {
              year: row.move_in_year,
              month: row.move_in_month,
              period: row.move_in_period,
            },
    }));
    const applications = applicationListSchema.parse({ items, total, page, pageSize });
    await client.query("COMMIT");
    return applications;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
