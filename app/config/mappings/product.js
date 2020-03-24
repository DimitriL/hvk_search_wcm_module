module.exports = {
	"properties": {
		"fields": {
			"type": "object",
			"properties": {
				"productCategory": {
					"type": "string",
					"index": "not_analyzed",
				},
				"title": {
					"type": "nested",
					"properties": {
						"value": {
							"type": "string",
						},
					},
				},
				"intro": {
					"type": "nested",
					"properties": {
						"value": {
							"type": "string",
						},
					},
				},
				"about": {
					"type": "nested",
					"properties": {
						"value": {
							"type": "string",
						},
					},
				},
				"gettingStarted": {
					"type": "nested",
					"properties": {
						"value": {
							"type": "string",
						},
					},
				},
				"body": {
					"type": "nested",
					"properties": {
						"value": {
							"type": "string",
						},
					},
				},
				"roadmap": {
					"type": "nested",
					"properties": {
						"title": {
							"type": "string",
						},
						"notes": {
							"type": "string",
						},
						"version": {
							"type": "string",
						},
						"uuid": {
							"index": "not_analyzed",
							"type": "string",
						},
					},
				},
				"customItems": {
					"type": "nested",
					"properties": {
						"body": {
							"type": "string",
						},
						"title": {
							"type": "string",
						},
						"uuid": {
							"index": "not_analyzed",
							"type": "string",
						},
						"slug": {
							"index": "no",
							"type": "string",
						},
						"api": {
							"index": "not_analyzed",
							"type": "string",
						},
						"version": {
							"index": "not_analyzed",
							"type": "string",
						},
						"visibleFor": {
							"index": "not_analyzed",
							"type": "string",
						},
					},
				},
				"versionItems": {
					"type": "nested",
					"properties": {
						"version": {
							"type": "string",
						},
						"slug": {
							"index": "not_analyzed",
							"type": "string",
						},
						"value": {
							"type": "string",
						},
					},
				},
				"apiS": {
					"type": "nested",
					"properties": {
						"version": {
							"type": "string",
						},
						"api": {
							"index": "no",
							"type": "string",
						},
						"slug": {
							"index": "no",
							"type": "string",
						},
						"value": {
							"type": "string",
						},
						"uuid": {
							"index": "not_analyzed",
							"type": "string",
						},
					},
				},
			},
		},
		"meta": {
			"type": "object",
			"properties": {
				"contentType": {
					"index": "no",
					"type": "string",
				},
				"slug": {
					"index": "no",
					"type": "string",
				},
			},
		},
		"uuid": {
			"index": "no",
			"type": "string",
		},
	},
};
