// Wave Shock Animation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const waveContainer = document.querySelector('.wave-container');
    const svg = document.querySelector('.waves-svg');
    
    if (svg) {
        // Create additional wave circles for more effect
        const xmlns = "http://www.w3.org/2000/svg";
        const mainGroup = document.createElementNS(xmlns, "g");
        mainGroup.id = "additional-waves";
        
        // Add 10 more circles with different starting positions
        const positions = [
            {cx: "100", cy: "100"},
            {cx: "1100", cy: "100"},
            {cx: "100", cy: "700"},
            {cx: "1100", cy: "700"},
            {cx: "300", cy: "300"},
            {cx: "900", cy: "300"},
            {cx: "300", cy: "500"},
            {cx: "900", cy: "500"},
            {cx: "600", cy: "150"},
            {cx: "600", cy: "700"}
        ];
        
        positions.forEach((pos, index) => {
            const circle = document.createElementNS(xmlns, "circle");
            circle.setAttribute("cx", pos.cx);
            circle.setAttribute("cy", pos.cy);
            circle.setAttribute("r", "10");
            circle.setAttribute("class", `wave-circle wave-circle-${(index % 5) + 1}`);
            circle.setAttribute("fill", "none");
            circle.setAttribute("stroke-width", "2");
            
            // Varied delays
            const delayMultiplier = (index % 5) * 0.5;
            circle.style.animation = `waveShock${(index % 5) + 1} 4s ease-out infinite ${delayMultiplier + (0.1 * index)}s`;
            
            mainGroup.appendChild(circle);
        });
        
        // Insert after existing circles
        svg.appendChild(mainGroup);
    }
    
    // Optional: Add responsive glow updates
    function updateGlowPositions() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // This could be expanded to adjust positions based on viewport
        // For now, it just tracks viewport changes
    }
    
    window.addEventListener('resize', updateGlowPositions);
});
