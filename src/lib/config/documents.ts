export interface DocumentInfo {
	title: string;
	organization: string;
	category: 'Treaty' | 'Arsenals' | 'Emerging Tech' | 'Strategy' | 'Public Opinion';
	year: string;
	description: string;
	url?: string;
}

export const DOCUMENT_METADATA_MAP: Record<string, DocumentInfo> = {
	'YB26 08 World Nuclear Forces.pdf': {
		title: 'SIPRI Yearbook 2026: World Nuclear Forces',
		organization: 'SIPRI',
		category: 'Arsenals',
		year: '2026',
		description: 'Global warhead counts, operational deployments, and nuclear modernization programs.',
		url: 'https://www.sipri.org/yearbook/2026/08'
	},
	'YB26 14 AI Governance.pdf': {
		title: 'SIPRI Yearbook 2026: AI Governance',
		organization: 'SIPRI',
		category: 'Emerging Tech',
		year: '2026',
		description: 'Military artificial intelligence, autonomous weapon systems, and nuclear command & control risks.',
		url: 'https://www.sipri.org/yearbook/2026/14'
	},
	'YB26 16 Space Governance.pdf': {
		title: 'SIPRI Yearbook 2026: Space Governance',
		organization: 'SIPRI',
		category: 'Emerging Tech',
		year: '2026',
		description: 'Counter-space capabilities, orbital warfare risks, and early warning satellite survivability.',
		url: 'https://www.sipri.org/yearbook/2026/16'
	},
	'yb26_summary_en_0.pdf': {
		title: 'SIPRI Yearbook 2026: Summary',
		organization: 'SIPRI',
		category: 'Strategy',
		year: '2026',
		description: 'Executive summary on international armaments, disarmament, and global security.',
		url: 'https://www.sipri.org/yearbook/2026'
	},
	'factshet_2017_treaty_prohibition_of_nuclear_weapons_web.pdf': {
		title: 'Treaty on the Prohibition of Nuclear Weapons (TPNW) Core Factsheet',
		organization: 'United Nations / ICAN',
		category: 'Treaty',
		year: '2017-2026',
		description: 'Legal prohibitions, state obligations, victim assistance, and environmental remediation.',
		url: 'https://www.un.org/disarmament/wmd/nuclear/tpnw/'
	},
	'26_17_BASIC_Preparing-for-the-First-Review-Conference-of-the-Treaty-on-the-Prohibition-of-Nuclear-Weapons_report_02-1.pdf': {
		title: 'Preparing for the First TPNW Review Conference',
		organization: 'BASIC',
		category: 'Treaty',
		year: '2022',
		description: 'Analysis and strategic recommendations for multilateral verification and implementation.',
		url: 'https://basicint.org/report/preparing-for-the-first-tpnw-review-conference/'
	},
	'26_18_BASIC_Envisioning-Future-Pathways-for-the-Nuclear-Non-Proliferation-Treaty_02.pdf': {
		title: 'Envisioning Future Pathways for the NPT',
		organization: 'BASIC',
		category: 'Treaty',
		year: '2022',
		description: 'Pathways to revitalize the Nuclear Non-Proliferation Treaty and overcome Article VI deadlock.',
		url: 'https://basicint.org/report/envisioning-future-pathways-for-the-npt/'
	},
	'Addressing-Future-Nuclear-Crisis-Scenarios-in-South-Asia.pdf': {
		title: 'Addressing Future Nuclear Crisis Scenarios in South Asia',
		organization: 'BASIC / Strategic Stability',
		category: 'Strategy',
		year: '2023',
		description: 'Escalation dynamics, crisis management, and deterrence stability among India, Pakistan, and China.',
		url: 'https://basicint.org/report/addressing-future-nuclear-crisis-scenarios-in-south-asia/'
	},
	'MSAS_BRIEF_FINAL.pdf': {
		title: 'Missile Systems and Strategic Stability (MSAS) Brief',
		organization: 'BASIC',
		category: 'Strategy',
		year: '2023',
		description: 'Hypersonic glide, missile defenses, and impacts on strategic deterrence equilibrium.',
		url: 'https://basicint.org/briefing/missile-systems-and-strategic-stability/'
	},
	'atomic-responsiveness-how-public-opinion-shapes-elite-beliefs-and-preferences-on-nuclear-weapon-use.pdf': {
		title: 'Atomic Responsiveness: Public Opinion & Elite Nuclear Beliefs',
		organization: 'Academic Policy Research',
		category: 'Public Opinion',
		year: '2024',
		description: 'Empirical analysis of how public anti-nuclear attitudes constrain political decision-makers.',
		url: 'https://doi.org/10.1093/fpa/orae013'
	},
	'civil-society-and-the-conference-on-disarmament-360.pdf': {
		title: 'Civil Society & the UN Conference on Disarmament',
		organization: 'UN / Civil Society',
		category: 'Strategy',
		year: '2022',
		description: 'Examining non-governmental diplomacy and civil society engagement in Geneva arms control.',
		url: 'https://unidir.org/publication/civil-society-and-conference-disarmament'
	},
	'mayors_for_peace_file-02_document_pack2_en.pdf': {
		title: 'Mayors for Peace: Action Plan & Municipal Appeals',
		organization: 'Mayors for Peace',
		category: 'Public Opinion',
		year: '2023',
		description: 'City-led nuclear abolition network inspired by Hiroshima and Nagasaki appeals.',
		url: 'https://www.mayorsforpeace.org/en/action-plan/'
	}
};

export function getFriendlyDocumentInfo(filename: string): DocumentInfo {
	return (
		DOCUMENT_METADATA_MAP[filename] || {
			title: filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
			organization: 'Research Document',
			category: 'Strategy',
			year: '2026',
			description: 'Nuclear disarmament and arms control policy report.'
		}
	);
}
