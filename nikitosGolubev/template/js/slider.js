/*** !!!!README!!!! ***/
/*
	Author - Nikita Golubev - Feb25 2018
	WebSite - nikitosgolubev.com
	GitHub - https://github.com/NikitosGolubev
*/
/*
	---How to use this slider libary?
	1) You have to set a UNIQUE id to container which will contains slides
	2) You have to create control(-s) and there: {
		---Required
		Main Control(-s) container has to contain a class SLIDERID_controls
		Previous/Left btn has to contain class name - leftSliderControl
		Next/Right btn has to contain class name - rightSliderControl
		---Not Required
		Navigate points, there container should contain .points class
		Every point would be automaticly specified as .point
	}
	3) Include slider.js, slider.css and animate.css files
	4) You have to run a slider function below including slider.js file
	5) Put a .notSlide to all children elements of sliderId container which should not behave like slides
	---IMPORTANT
	1) CHECK animate.css IN functions to choose animation you want
	2) Look at slider.css to not to confront to styles(classes)
	and also you can manipulate them according your own purposes
*/

/*** BASIC FUNCTIONS(Builders) ***/

/* MAIN FUNCTION that let slider work 
	---What does it do?
	1) Fills the data about slider into sliderStorage
	2) Creates points, defines slides and basic animation class(.animated, look animate.css library)
	3) Finds first slide, and makes it active(visible) 
	4) Set an active slide which should be visible
	---Arguments:
	sliderId - UNIQUE ID of html element, where slides a contained
	animationName - a name of animate.css class, which defines an animation type of SHOWING slide
	$displayType - define a class which will be responsible for type of display of active slide
	$needPoints - if navigation points are needed or not
*/
function slider(sliderId, animationName, $displayType = "Block", $needPoints = false) {
	// To make our class name valid despite case of string that user typed
	$displayType = ucfirst($displayType.toLowerCase());

	// Fills the data about slider into sliderStorage
	// Format: {sliderUniqueId: Map(sliderData => sliderData)}
	// sliderCounter - index of active slide
	slidersStorage[sliderId] = new Map([
		['sliderCounter', 0], 
		['sliderAnimationType', animationName], 
		['activeClass', "activeSlide"+$displayType], 
		['needPoints', $needPoints]
	]);

	let slider = document.getElementById(sliderId);
	let slides = Array.from(slider.children); // Getting all possible slides
	// Filtering slides, create navigate points, set some required classes
	setNecessaryClassesAndCreatePoints(slides, sliderId, $needPoints);

	// Finds first SLIDE(demanded bcs, there could be .notSlides too)
	let i = 0;
	while (slides[i].classList.contains("notSlide")) {
		i++;
	}
	// And makes it active(visible)
	slides[i].classList.add(slidersStorage[sliderId].get('activeClass'));
}

/*** Important varriables and constants ***/

// Main global storage, which contains all the data about curretly existed sliders on a page
let slidersStorage = {}; // Format: {sliderUniqueId: Map(sliderData => sliderData)}

/*** Event Listeners ***/

// Common event listener for all types of actions that user can take which relates to slider
document.querySelector('body').addEventListener('click', (event) => {
	/*** ATTENTION! ***/
	/* 1) currentSliderId - its a variable which contains current slider id(which uses at the particuar
	moment). BASED ON CONTROLS PANEL CLASS - .SLIDERID_controls*/
	/* 2) getSliderIdByControlsBlock a function which define which slider is related with currently
	using controls system*/

	// IF user clicks on leftBtn(or get previous slide or left arrow, etc...)
	if (event.target.classList.contains('leftSliderControl')) {
		let currentSliderId = getSliderIdByControlsBlock(event);
		changeSlide(event, currentSliderId, "left");
	}

	// IF user clicks on rightBtn(or get next slide or right arrow, etc...)
	if (event.target.classList.contains('rightSliderControl')) {
		let currentSliderId = getSliderIdByControlsBlock(event);
		changeSlide(event, currentSliderId, "right");
	}

	// IF user clicks on point(getting a particular slide, corelated with html element(point))
	if (event.target.classList.contains('point')) {
		let currentSliderId = getSliderIdByControlsBlock(event);
		changeSlide(event, currentSliderId, "point")
	}
});

/* A function which replies to event which imply a slide changing 
---Arguments
event - current event action
sliderId - UNIQUE slider id, which defines the data location in storage]
action - type of slide changing
*/
function changeSlide(event, sliderId, action) {
	// Getting data from storage
	let currentSliderData = slidersStorage[sliderId];

	// Getting all the slides inside slider
	let slides = document.querySelectorAll("#"+sliderId+" .slide");
	// Getting current value of slider counter
	// Basicly - which slide is active currently
	let sliderCounter = currentSliderData.get('sliderCounter');
	// Remembering sliderCounter, bcs it will change
	let oldSlideIndex = sliderCounter;
	// Getting an animation type (animate.css)
	let sliderAnimationType = currentSliderData.get('sliderAnimationType');
	// Get active slide class
	let activeSlideClass = currentSliderData.get('activeClass');
	// Are navigation points are required?
	let needPoints = currentSliderData.get('needPoints');


	// Hiding active slide
	slides[sliderCounter].classList.remove(activeSlideClass);
	// Makes down scroll invisible(bcs of animations)
	document.body.style.overflowX = "hidden";

	/*
		If we have to show previous slide,
		SO, we check if the slide index isnt equals to zero, 
		if so, we set them last index of haystack
		else just substract a unit from current index
	*/
	if (action === 'left') 
		(sliderCounter <= 0) ? sliderCounter = --slides.length : --sliderCounter;
	/*
		If we have to show next slide,
		SO, we check if the slide index isnt equals to last index in haystack, 
		if so, we set them a zero value
		else just add a unit to current index
	*/
	else if (action === 'right')
		(--slides.length == sliderCounter) ? sliderCounter = 0 : ++sliderCounter;
	/*
		If we have to show some slide based on html element(point),
		SO, we get value of attr slideNumber which means index value of slide
	*/
	else if (action === 'point') 
		sliderCounter = event.target.getAttribute('slideNumber');

	// Add an animation which will be implemented after every slide showing
	slides[sliderCounter].classList.add(sliderAnimationType);
	// Makes new slide visible
	slides[sliderCounter].classList.add(activeSlideClass);

	// Change points if needed
	if (needPoints) {
		document.querySelector("."+sliderId+"_controls [slideNumber='"+oldSlideIndex+"']").classList.remove('activePoint');
		document.querySelector("."+sliderId+"_controls [slideNumber='"+sliderCounter+"']").classList.add('activePoint');
	}
	
	// Updating slider counter(current active index) in storage
	slidersStorage[sliderId].set('sliderCounter', sliderCounter);
}

/* A function which creates navigate points and define classes
---Arguments
slides - slider children
sliderId - a slider
*/
function setNecessaryClassesAndCreatePoints(slides, sliderId, needPoints) {
	// Getting a block where points are contained
	let pointsBlock = document.querySelector("."+sliderId+"_controls .points");

	slides.forEach((slide, index) => {
		// Filtering slides(.notSlide elem doesn't have to possess further classes)
		if (!slide.classList.contains('notSlide')) {
			// Creating points if needed
			if (needPoints) {
				// Creating point
				let point = document.createElement("div");

				point.className = 'point'; // set a basic class name
				// set a SLIDE NUMBER attribute which value is equals to slide index in haystack
				point.setAttribute('slideNumber', index);
				pointsBlock.appendChild(point);
			}

			slide.classList.add('animated'); // animate.css basic class
			slide.classList.add('slide'); // a class which defines a slide
		}
	});
	// Set a class(if needed) which makes a first point active(due to first slide is active too)
	if (needPoints) pointsBlock.firstElementChild.classList.add('activePoint');
}

/* A function which gets a unique slider ID by controls panel */
function getSliderIdByControlsBlock(event) {
	// Looping through all sliders Ids
	for (let sliderId in slidersStorage) {
		let findControlsMainParent = event.target.parentNode; // getting first parent
		// creating a class which should contain a controls panel
		let controlsClassName = sliderId+"_controls";

		// Looping through all parents until we will get the body tag(means that nothing found)
		// Or we will get a controls panel which contains controlsClassName
		// IF controls panel doesnt contain controlsClassName
		while (!findControlsMainParent.classList.contains(controlsClassName)) {
			if (findControlsMainParent.tagName === "BODY") break;
			// Get next parent
			findControlsMainParent = findControlsMainParent.parentNode;
		}
		// If controls panel(related with sliderId) found, so return sliderId
		if (findControlsMainParent.classList.contains(controlsClassName)) return sliderId;
	}
}

// Makes first letter of string upper case (like in PHP)
function ucfirst(str) {
	// Getting first symbol and making it Upper case
    let f = str.charAt(0).toUpperCase();
    // Paste this symbol at the beginning of the string and return it
    return f + str.substr(1, str.length-1);
}