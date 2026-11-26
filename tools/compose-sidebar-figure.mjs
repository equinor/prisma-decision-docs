export async function composeSidebarFigure(page, collapsed, expanded) {
	const margin = 20;
	const panelPadding = 8;
	const gap = 170;
	const arrowWidth = 148;
	const arrowHeight = 58;
	const contentHeight = Math.max(collapsed.height, expanded.height);
	const panelHeight = contentHeight + panelPadding * 2;
	const collapsedPanelWidth = collapsed.width + panelPadding * 2;
	const expandedPanelWidth = expanded.width + panelPadding * 2;
	const collapsedX = margin;
	const expandedX = collapsedX + collapsedPanelWidth + gap;
	const width = expandedX + expandedPanelWidth + margin;
	const height = panelHeight + margin * 2;
	const panelY = margin;
	const arrowX = collapsedX + collapsedPanelWidth + (gap - arrowWidth) / 2;
	const arrowY = panelY + panelPadding + (contentHeight - arrowHeight) / 2;
	const collapsedY = panelY + panelPadding + (contentHeight - collapsed.height) / 2;
	const expandedY = panelY + panelPadding + (contentHeight - expanded.height) / 2;
	const svg = `\
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
	<defs>
		<filter id="panel-shadow" x="-20%" y="-20%" width="140%" height="150%">
			<feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#17464d" flood-opacity=".14"/>
		</filter>
		<filter id="arrow-shadow" x="-20%" y="-25%" width="150%" height="170%">
			<feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#12383d" flood-opacity=".25"/>
		</filter>
		<linearGradient id="arrow-face" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#92f0ec"/>
			<stop offset=".48" stop-color="#24c3c4"/>
			<stop offset="1" stop-color="#078b98"/>
		</linearGradient>
		<linearGradient id="arrow-side" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#075f6b"/>
			<stop offset="1" stop-color="#043e4c"/>
		</linearGradient>
		<clipPath id="left-snapshot">
			<rect x="${collapsedX + panelPadding}" y="${collapsedY}" width="${collapsed.width}" height="${collapsed.height}" rx="4"/>
		</clipPath>
		<clipPath id="right-snapshot">
			<rect x="${expandedX + panelPadding}" y="${expandedY}" width="${expanded.width}" height="${expanded.height}" rx="4"/>
		</clipPath>
	</defs>
	<rect width="100%" height="100%" fill="#f5f9fa"/>
	<g filter="url(#panel-shadow)">
		<rect x="${collapsedX}" y="${panelY}" width="${collapsedPanelWidth}" height="${panelHeight}" rx="10" fill="#fff" stroke="#dce8e9"/>
		<rect x="${expandedX}" y="${panelY}" width="${expandedPanelWidth}" height="${panelHeight}" rx="10" fill="#fff" stroke="#dce8e9"/>
	</g>
	<image x="${collapsedX + panelPadding}" y="${collapsedY}" width="${collapsed.width}" height="${collapsed.height}" preserveAspectRatio="none" clip-path="url(#left-snapshot)" href="data:image/png;base64,${collapsed.image.toString('base64')}"/>
	<image x="${expandedX + panelPadding}" y="${expandedY}" width="${expanded.width}" height="${expanded.height}" preserveAspectRatio="none" clip-path="url(#right-snapshot)" href="data:image/png;base64,${expanded.image.toString('base64')}"/>
	<g transform="translate(${arrowX} ${arrowY})" filter="url(#arrow-shadow)">
		<path d="M2 16H91V1L148 29L91 57V42H2Z" transform="translate(0 7)" fill="url(#arrow-side)"/>
		<path d="M2 16H91V1L148 29L91 57V42H2Z" fill="url(#arrow-face)" stroke="#087784" stroke-width="1.5" stroke-linejoin="round"/>
		<path d="M9 19H85V10L126 29" fill="none" stroke="#e8ffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>
		<path d="M93 4L143 29L93 54L104 29Z" fill="#087f8b" opacity=".28"/>
	</g>
</svg>`;
	const compositionPage = await page.context().newPage();
	try {
		await compositionPage.setContent(svg);
		await compositionPage.waitForFunction(() =>
			Array.from(document.images).every(image => image.complete && image.naturalWidth > 0),
		);
		return await compositionPage.locator('svg').screenshot({ animations: 'disabled' });
	} finally {
		await compositionPage.close();
	}
}
