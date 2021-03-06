import clickhouse from '$lib/clickhouse.js';

export async function get() {
	const dropQueries = [
		'DROP TABLE IF EXISTS products',
		'DROP TABLE IF EXISTS cart_products',
		'DROP TABLE IF EXISTS coupons'
	];
	// task:
	// -- products: id, price, no_discount_flag (bool)
	// -- cart_products: id, product_id, amount
	// -- coupons: id, discount_value (% of product price)
	const queries = [
		// no_discount_flag is a boolean and nullable for create via random a higher probability of getting a discount for every 1000 values
		'CREATE TABLE IF NOT EXISTS products (id UUID NOT NULL, price UInt8, no_discount_flag Nullable(BOOLEAN)) ENGINE = GenerateRandom(NULL, 2, 3)',
		'CREATE TABLE IF NOT EXISTS cart_products (id UUID NOT NULL, product_id UUID, amount TINYINT) ENGINE = Memory',
		'CREATE TABLE IF NOT EXISTS coupons (id UUID NOT NULL, discount_value TINYINT) ENGINE = GenerateRandom(1, 2, 3)'
	];
	try {
		// create default database if not exists
		await clickhouse.queryPromise(
			"CREATE DATABASE IF NOT EXISTS default ENGINE = Memory COMMENT 'The test database'"
		);
		await Promise.all(dropQueries.map((query) => clickhouse.queryPromise(query)));
		await Promise.all(queries.map((query) => clickhouse.queryPromise(query)));
	} catch (e) {
		console.log(e);
		return {
			status: 500,
			body: {
				message: 'could not create table',
				result: false
			}
		};
	}

	return {
		status: 200,
		body: {
			message: 'tables created',
			result: true
		}
	};
}
