"use strict";

require("rootpath")();
var runQueue = require("./queue").runQueue;
var _ = require("lodash");
var path = require("path");

var ContentModel = require(path.join(process.cwd(), "app/models/content"));
var PopulateHelper = require(path.join(process.cwd(), "app/helpers/populate"));
var languageHelper = require("./language");
var contentTypesHelper = require("./contentTypes");
var taxonomiesHelper = require("./taxonomy");

var contentMongoQuery = function(type) {
	return {
		"meta.contentType": contentTypesHelper()[type],
		"meta.published": true,
		"meta.deleted": false,
	};
};
var contentMongoFields = {
	_id: 0,
	uuid: 1,
	fields: 1,
	"meta.activeLanguages": 1,
	"meta.contentType": "1",
	"meta.created": "1",
	"meta.lastModified": "1",
	"meta.publishDate": 1,
	"meta.slug": 1,
	"meta.taxonomy": 1,
};

function errHandler(err) {
	throw err;
}

function fetchOne(query, fields) {
	return ContentModel
		.findOne(query, fields)
		.populate("meta.contentType")
		.lean()
		.exec();
}

function fetchContent(query, fields) {
	return ContentModel
		.find(query, fields)
		.populate("meta.contentType")
		.lean()
		.exec();
}

function fetchDoc(doc, type) {
	type = (typeof type === "string") ? type : type.type;
	return fetchOne(
			_.assign(contentMongoQuery(type), {
				uuid: typeof doc === "string" ? doc : doc.uuid,
			}),
			contentMongoFields
		)
		.then(function(item){
			return populateDoc(type, item)
				.then(function(pDoc) {
					return pDoc;
				}, errHandler);
		});
}

function populateDoc(type, doc) {
	return PopulateHelper.fields.one(doc, {
		populate: "uitgelichtItem,paragrafen,datums",
		lang: languageHelper.currentLanguage(), // @todo: get language from request
	}).then(function(item) {
		return parseDoc(type, _.assign(item, {
			fields: _.assign(doc.fields, item.fields),
		}));
	}, errHandler);
}

function parseDoc(type, doc) {
	var item = _.cloneDeep(doc);
	return item;
}

function fetchDocs(contentType) {
	var parsed = [];

	return fetchContent(
		contentMongoQuery(contentType),
		contentMongoFields
	)
	.then(function(docs) {
		return runQueue(docs.map(function(doc) {
			return function() {
				return populateDoc(contentType, doc)
					.then(function(pDoc) {
						parsed.push(pDoc);
					}, errHandler);
			};
		}));
	}, errHandler)
	.then(function() {
		return parsed;
	}, errHandler);
}

function docExists(uuid, elasticsearch) {
	return elasticsearch.client.exists({
		index: elasticsearch.index,
		type: "content",
		id: uuid,
	});
}

function syncDoc(doc, elasticsearch) {
	return docExists(verifyUuid(doc), elasticsearch, "content")
		.then(function(exists) {
			return exists ? updateDoc(doc, elasticsearch) : createDoc(doc, elasticsearch);
		}, errHandler);
}

function syncDocs(docs, elasticsearch) {
	return runQueue(docs.map(function(doc) {
		return function() {
			return syncDoc(doc, elasticsearch);
		};
	}));
}

function createDoc(doc, elasticsearch) {
	return elasticsearch.client.create({
		index: elasticsearch.index,
		type: "content",
		id: doc.uuid,
		body: transformDoc(doc),
	});
}

function updateDoc(doc, elasticsearch) {
	return elasticsearch.client.update({
		index: elasticsearch.index,
		type: "content",
		id: doc.uuid,
		body: {
			doc: transformDoc(doc),
		},
	});
}

function removeDoc(doc, elasticsearch) {
	return elasticsearch.client.delete({
		index: elasticsearch.index,
		type: "content",
		id: doc.uuid,
	});
}

function transformField(field) {
	return {
		value: languageHelper.verifyMultilanguage(field),
	};
}

function transformDoc(doc) {
	
	var meta = {
		activeLanguages: doc.meta.activeLanguages,
		contentType: typeof doc.meta.contentType === "string" ? doc.meta.contentType : contentTypesHelper.verifyType(doc.meta.contentType).type,
		created: doc.meta.created,
		lastModified: doc.meta.lastModified,
		publishDate: doc.meta.publishDate,
		slug: languageHelper.verifyMultilanguage(doc.meta.slug), // @todo: return slug for active language
	};

	meta.taxonomy = _parseTaxonomy(doc.meta.taxonomy.tags);

	var fields = {
		titel: doc.fields.titel,
		introtekst: doc.fields.introtekst || null,		
		synoniemen: (doc.fields.synoniemen) ? doc.fields.synoniemen.split(",") : [],
		paragrafen: _parseParagraphs(doc.fields.paragrafen),
		locatie: null,
		activiteit: null,
		partner: null,
		afbeelding: _parseImage(doc.fields.fotoHoofding)
	};

	if(meta.contentType == 'locatie') {
		fields.locatie = _parseLocatie(doc.fields);
	}

	if(meta.contentType == 'activiteit') {
		fields.activiteit = _parseActiviteit(doc.fields);
	}

	if(meta.contentType == 'partner') {
		fields.partner = _parsePartner(doc.fields);
	}
	return {
		uuid: doc.uuid,
		fields: fields,
		meta: meta,
	};
}

function _parseImage(image) {

	if(!image) return null;

	return {
		url : image.original.asset.url || null,
		copyright: image.meta.copyright || null,
		onderschrift: image.meta.description || null,
		alt: image.meta.title || null
	};
}

function _parseTaxonomy(tags) {
	var parsedTaxonomies = {};
	var taxonomies = taxonomiesHelper.getTaxonomies();
	for(var tag of tags) {
		var tagLabel = tag.safeLabel;
		for(var tax of taxonomies){
			var taxLabel = tax.meta.safeLabel;
			if(!parsedTaxonomies[taxLabel]) parsedTaxonomies[taxLabel] = [];
			for(var txTag of tax.tags){
				if(txTag.safeLabel == tagLabel){
					parsedTaxonomies[taxLabel].push(tag);
					break;
				}
			}
		}
	}
	return parsedTaxonomies;	
}

function _parsePartner(fields) {
	return {
		naam: fields.naam,
		omschrijving: fields.omschrijving,
		website:  (fields.website) ? (fields.website.url) ? fields.website.url : null : null,
		type:  fields.partnerType,
	};
}

function _parseLocatie(fields) {
	return {
		website:{ 
			url: (fields.website) ? (fields.website.url) ? fields.website.url : null : null,
			description: (fields.website) ? fields.website.description : null 
		},
   		naam: fields.naam || null,
  		straatNr: fields.straatNr || null,
  		postcode: fields.postcode || null,
   		gemeente: fields.gemeente || null,
   		telefoonnummer: fields.telefoonnummer || null,
  		emailadres: fields.emailadres || null,
   		coordinaten: {
			lat: (fields.coordinatenLatLng) ? parseFloat(fields.coordinatenLatLng.split(',')[0].trim()) : null,
			lng: (fields.coordinatenLatLng) ? (fields.coordinatenLatLng.split(',')[1]) ? parseFloat(fields.coordinatenLatLng.split(',')[1].trim()) : null : null,
		}
	};
}

function _parseActiviteit(fields) {
	return {
		leeftijdscategorie: fields.leeftijdscategorie || null,
		reservatieUrl: (fields.reservatieUrl) ? (fields.reservatieUrl.url) ? fields.reservatieUrl.url : null : null,
		reservatieTekst: fields.reservatieTekst || null,
		datums: _parseDates(fields.datums),
		afbeelding: {
			url: (fields.afbeeldingUrl) ? (fields.afbeeldingUrl.url) ? fields.afbeeldingUrl.url : null : null,
			copyright: fields.afbeeldingCopyright || null, 
			onderschrift: fields.afbeeldingOnderschrift || null
		},
		locatie: {
			naam: fields.locatieNaam || null,
			straat: fields.locatieStraat || null,
			huisnummer: fields.locatieHuisnummer || null,
			postcode: fields.locatiePostcode || null,
			gemeente: fields.locatieGemeente || null,
			locatieId: fields.locatieId || null
		},
		organisatie: {
			naam: fields.organisatieNaam || null,
			email: fields.organisatieEmail || null,
			telefoon: fields.organisatieTelefoon || null
		}
	};    
}

function _parseDates(dates) {
	if(!dates) return [];
	var parsedDates = [];
	for(var date of dates) {		
		if(date.value){
			parsedDates.push({
				datumVanaf: date.value.fields.datumVanaf,
				datumTot: date.value.fields.datumTot,
				uurVanaf: date.value.fields.uurVanaf,
				uurTot: date.value.fields.uurTot,
			});
		}
	}
	return parsedDates;

}

function _parseParagraphs(paragraphs) {
	if(!paragraphs) return [];
	var indexable = ['tekst_paragraaf', 'quote_paragraaf', 'datumtijd', 'cta_paragraaf'];
	var parsedParagraphs = [];

	for(var para of paragraphs) {
		if(para.value && para.value.meta && indexable.includes(para.value.meta.contentType)) {
			switch(para.value.meta.contentType){
				case 'tekst_paragraaf':
					parsedParagraphs.push({
						'type': para.value.meta.contentType,
						'inhoud': para.value.fields.inhoud
					});
					break;
				case 'quote_paragraaf':
					parsedParagraphs.push({
						'type': para.value.meta.contentType,
						'quote': para.value.fields.quote
					});
					break;
				case 'cta_paragraaf':
					parsedParagraphs.push({
						'type': para.value.meta.contentType,
						'inhoud': para.value.fields.inhoud,
						'titel': para.value.fields.titel,
						'linkUrl': para.value.fields.linkUrl
					});
					break;
			}
		}
	}
	return parsedParagraphs;
}

function verifyUuid(doc) {
	return typeof doc === "string" ? doc : doc.uuid;
}

module.exports = {
	fetchDoc: fetchDoc,
	fetchDocs: fetchDocs,
	populateDoc: populateDoc,
	parseDoc: parseDoc,
	syncDocs: syncDocs, 
	syncDoc: syncDoc,
	removeDoc: removeDoc
};
