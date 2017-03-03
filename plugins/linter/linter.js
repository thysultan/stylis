(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	}
	else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	} 
	else {
		window.linter = factory(window);
	}
}(function (window) {
	var data = Object.create(null);
	var properties = Object.create(null);
	var selector = '';

	// this should replace data.props
	var props = {
		'cursor': {
			syntax: /auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|text|vertical-text|alias|copy|move|no-drop|not-allowed|e-resize|n-resize|ne-resize|nw-resize|s-resize|se-resize|sw-resize|w-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|col-resize|row-resize|all-scroll|zoom-in|zoom-out|grab|grabbing|hand|-webkit-grab|-webkit-grabbing|-webkit-zoom-in|-webkit-zoom-out|-moz-grab|-moz-grabbing|-moz-zoom-in|-moz-zoom-out/
		},
		'display': {
			syntax: /none|inline|block|list-item|inline-list-item|inline-block|inline-table|table|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row|table-row-group|flex|inline-flex|grid|inline-grid|run-in|ruby|ruby-base|ruby-text|ruby-base-container|ruby-text-container|contents|-ms-flexbox|-ms-inline-flexbox|-ms-grid|-ms-inline-grid|-webkit-flex|-webkit-inline-flex|-webkit-box|-webkit-inline-box|-moz-inline-stack|-moz-box|-moz-inline-box/
		},
		'fill': {
			syntax: /#[a-zA-Z0-9]{3,}/
		},
		'filter': {
			syntax: /none|/
		},
		'font': {
			syntax: /|/
		},
		'kerning': {
			syntax: /auto|/
		},
		'letter-spacing': {
			syntax: /normal|/
		},
		'max-width': {
			syntax: /none|max-content|min-content|fit-content|fill-available|\d+|\.\d+/
		},
		'min-width': {
			syntax: /auto|max-content|min-content|fit-content|fill-available|\d+|\.\d+/
		},
		'offset-position': {
			syntax: /auto|/
		},
		'opacity': {
			syntax: /\d+|\.\d+|/
		},
		'zoom': {
			syntax: /normal|reset|/
		},
		'appearance': {
			syntax: /none|button|button-bevel|caps-lock-indicator|caret|checkbox|default-button|listbox|listitem|media-fullscreen-button|media-mute-button|media-play-button|media-seek-back-button|media-seek-forward-button|media-slider|media-sliderthumb|menulist|menulist-button|menulist-text|menulist-textfield|push-button|radio|scrollbarbutton-down|scrollbarbutton-left|scrollbarbutton-right|scrollbarbutton-up|scrollbargripper-horizontal|scrollbargripper-vertical|scrollbarthumb-horizontal|scrollbarthumb-vertical|scrollbartrack-horizontal|scrollbartrack-vertical|searchfield|searchfield-cancel-button|searchfield-decoration|searchfield-results-button|searchfield-results-decoration|slider-horizontal|slider-vertical|sliderthumb-horizontal|sliderthumb-vertical|square-button|textarea|textfield/
		}
	};

	data.props = `
		-ms-overflow-style,
		-moz-appearance,
		-moz-binding,
		-moz-border-bottom-colors,
		-moz-border-left-colors,
		-moz-border-right-colors,
		-moz-border-top-colors,
		-moz-float-edge,
		-moz-force-broken-image-icon,
		-moz-image-region,
		-moz-orient,
		-moz-outline-radius,
		-moz-outline-radius-bottomleft,
		-moz-outline-radius-bottomright,
		-moz-outline-radius-topleft,
		-moz-outline-radius-topright,
		-moz-stack-sizing,
		-moz-text-blink,
		-moz-user-focus,
		-moz-user-input,
		-moz-user-modify,
		-moz-window-shadow,
		-webkit-border-before,
		-webkit-border-before-color,
		-webkit-border-before-style,
		-webkit-border-before-width,
		-webkit-box-reflect,
		-webkit-mask,
		-webkit-mask-attachment,
		-webkit-mask-clip,
		-webkit-mask-composite,
		-webkit-mask-image,
		-webkit-mask-origin,
		-webkit-mask-position,
		-webkit-mask-position-x,
		-webkit-mask-position-y,
		-webkit-mask-repeat,
		-webkit-mask-repeat-x,
		-webkit-mask-repeat-y,
		-webkit-tap-highlight-color,
		-webkit-text-fill-color,
		-webkit-text-stroke,
		-webkit-text-stroke-color,
		-webkit-text-stroke-width,
		-webkit-touch-callout,
		align-content,
		align-items,
		align-self,
		all,
		animation,
		animation-delay,
		animation-direction,
		animation-duration,
		animation-fill-mode,
		animation-iteration-count,
		animation-name,
		animation-play-state,
		animation-timing-function,
		appearance,
		azimuth,
		backdrop-filter,
		backface-visibility,
		background,
		background-attachment,
		background-blend-mode,
		background-clip,
		background-color,
		background-image,
		background-origin,
		background-position,
		background-position-x,
		background-position-y,
		background-repeat,
		background-size,
		block-size,
		border,
		border-block-end,
		border-block-end-color,
		border-block-end-style,
		border-block-end-width,
		border-block-start,
		border-block-start-color,
		border-block-start-style,
		border-block-start-width,
		border-bottom,
		border-bottom-color,
		border-bottom-left-radius,
		border-bottom-right-radius,
		border-bottom-style,
		border-bottom-width,
		border-collapse,
		border-color,
		border-image,
		border-image-outset,
		border-image-repeat,
		border-image-slice,
		border-image-source,
		border-image-width,
		border-inline-end,
		border-inline-end-color,
		border-inline-end-style,
		border-inline-end-width,
		border-inline-start,
		border-inline-start-color,
		border-inline-start-style,
		border-inline-start-width,
		border-left,
		border-left-color,
		border-left-style,
		border-left-width,
		border-radius,
		border-right,
		border-right-color,
		border-right-style,
		border-right-width,
		border-spacing,
		border-style,
		border-top,
		border-top-color,
		border-top-left-radius,
		border-top-right-radius,
		border-top-style,
		border-top-width,
		border-width,
		bottom,
		box-align,
		box-decoration-break,
		box-direction,
		box-flex,
		box-flex-group,
		box-lines,
		box-ordinal-group,
		box-orient,
		box-pack,
		box-shadow,
		box-sizing,
		box-suppress,
		break-after,
		break-before,
		break-inside,
		caption-side,
		caret-color,
		clear,
		clip,
		clip-path,
		color,
		column-count,
		column-fill,
		column-gap,
		column-rule,
		column-rule-color,
		column-rule-style,
		column-rule-width,
		column-span,
		column-width,
		columns,
		contain,
		content,
		counter-increment,
		counter-reset,
		cursor,
		direction,
		display,
		display-inside,
		display-list,
		display-outside,
		empty-cells,
		filter,
		flex,
		flex-basis,
		flex-direction,
		flex-flow,
		flex-grow,
		flex-shrink,
		flex-wrap,
		float,
		font,
		font-family,
		font-feature-settings,
		font-kerning,
		font-language-override,
		font-variation-settings,
		font-size,
		font-size-adjust,
		font-stretch,
		font-style,
		font-synthesis,
		font-variant,
		font-variant-alternates,
		font-variant-caps,
		font-variant-east-asian,
		font-variant-ligatures,
		font-variant-numeric,
		font-variant-position,
		font-weight,
		grid,
		grid-area,
		grid-auto-columns,
		grid-auto-flow,
		grid-auto-rows,
		grid-column,
		grid-column-end,
		grid-column-gap,
		grid-column-start,
		grid-gap,
		grid-row,
		grid-row-end,
		grid-row-gap,
		grid-row-start,
		grid-template,
		grid-template-areas,
		grid-template-columns,
		grid-template-rows,
		height,
		hyphens,
		image-orientation,
		image-rendering,
		image-resolution,
		ime-mode,
		initial-letter,
		initial-letter-align,
		inline-size,
		isolation,
		justify-content,
		left,
		letter-spacing,
		line-break,
		line-height,
		list-style,
		list-style-image,
		list-style-position,
		list-style-type,
		margin,
		margin-block-end,
		margin-block-start,
		margin-bottom,
		margin-inline-end,
		margin-inline-start,
		margin-left,
		margin-right,
		margin-top,
		marker-offset,
		mask,
		mask-clip,
		mask-composite,
		mask-image,
		mask-mode,
		mask-origin,
		mask-position,
		mask-repeat,
		mask-size,
		mask-type,
		max-block-size,
		max-height,
		max-inline-size,
		max-width,
		min-block-size,
		min-height,
		min-inline-size,
		min-width,
		mix-blend-mode,
		object-fit,
		object-position,
		offset,
		offset-anchor,
		offset-block-end,
		offset-block-start,
		offset-inline-end,
		offset-inline-start,
		offset-distance,
		offset-path,
		offset-rotate,
		opacity,
		order,
		orphans,
		outline,
		outline-color,
		outline-offset,
		outline-style,
		outline-width,
		overflow,
		overflow-clip-box,
		overflow-wrap,
		overflow-x,
		overflow-y,
		padding,
		padding-block-end,
		padding-block-start,
		padding-bottom,
		padding-inline-end,
		padding-inline-start,
		padding-left,
		padding-right,
		padding-top,
		page-break-after,
		page-break-before,
		page-break-inside,
		perspective,
		perspective-origin,
		pointer-events,
		position,
		quotes,
		resize,
		right,
		ruby-align,
		ruby-merge,
		ruby-position,
		scroll-behavior,
		scroll-snap-coordinate,
		scroll-snap-destination,
		scroll-snap-points-x,
		scroll-snap-points-y,
		scroll-snap-type,
		scroll-snap-type-x,
		scroll-snap-type-y,
		shape-image-threshold,
		shape-margin,
		shape-outside,
		tab-size,
		table-layout,
		text-align,
		text-align-last,
		text-combine-upright,
		text-decoration,
		text-decoration-color,
		text-decoration-line,
		text-decoration-skip,
		text-decoration-style,
		text-emphasis,
		text-emphasis-color,
		text-emphasis-position,
		text-emphasis-style,
		text-indent,
		text-orientation,
		text-overflow,
		text-rendering,
		text-shadow,
		text-size-adjust,
		text-transform,
		text-underline-position,
		top,
		touch-action,
		transform,
		transform-box,
		transform-origin,
		transform-style,
		transition,
		transition-delay,
		transition-duration,
		transition-property,
		transition-timing-function,
		unicode-bidi,
		user-select,
		vertical-align,
		visibility,
		white-space,
		widows,
		width,
		will-change,
		word-break,
		word-spacing,
		word-wrap,
		writing-mode,
		z-index
	`.replace(/\s/g, '').split(',');

	var properties = new Set(data.props);

	return function (ctx, str, line, column, namespace, length) {
		switch (ctx) {
			case 1: {
				if (str.indexOf('@') === 0) {
					// console.log(0, '@at-rule:', str);
				} else {
					selector = str + ' {';
					// console.log(0, 'selector:', str);
				}

				break;
			}
			case 2: {
				var indexOf = str.indexOf(':');

				var name = str.substring(0, indexOf).trim();
				var value = str.substring(indexOf+1, str.length-1).trim();

				// validate property name
				if (properties.has(name) === false) {
					console.error(`
	"${name}" is not a valid css property on 

		line: ${line}, 
		column: ${column}, 
		selector: \`${selector}\`
	`.trim());
				}
				// validate value
				else if (false) {

				}

				break;
			}
			case 6: {
				selector = '';

				break;
			}
			case 7: {
				console.log(0, 'invalid:', str, line, column);

				break;
			}
		}
	}
}));