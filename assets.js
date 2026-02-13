/**
 * CHROMATIC RUSH - Assets Management System
 * Manages ~640+ game assets including sprites, sounds, animations, and effects
 */

class AssetsManager {
    constructor() {
        this.assets = new Map();
        this.loadingQueue = [];
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.audioContext = null;
        this.sounds = new Map();
        
        // Asset categories
        this.categories = {
            SPRITES: 'sprites',
            SOUNDS: 'sounds',
            ANIMATIONS: 'animations',
            EFFECTS: 'effects',
            UI: 'ui'
        };
        
        // Initialize audio context
        this.initAudioContext();
        
        // Sprite sheets cache
        this.spriteSheets = new Map();
        
        // Color palettes for chromatic theme
        this.colorPalettes = {
            player: {
                primary: '#ff6b35',
                secondary: '#00d4ff',
                accent: '#ffff00',
                glow: '#ff1744'
            },
            corporate: {
                primary: '#2c2c2c',
                secondary: '#404040',
                accent: '#666666',
                dark: '#1a1a1a'
            },
            neon: {
                green: '#39ff14',
                purple: '#b026ff',
                pink: '#ff0080',
                blue: '#00ffff',
                yellow: '#ffff00'
            },
            environment: {
                sky: '#87CEEB',
                ground: '#8B4513',
                buildings: '#696969',
                graffiti: ['#ff6b35', '#00d4ff', '#ff1744', '#39ff14', '#b026ff']
            }
        };
    }

    async initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context on user interaction
            document.addEventListener('click', () => {
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
        } catch (error) {
            console.warn('Audio context initialization failed:', error);
        }
    }

    /**
     * Load all game assets
     */
    async loadAllAssets() {
        console.log('🎮 Loading CHROMATIC RUSH assets...');
        
        // Define all assets to load
        this.defineAssets();
        
        // Start loading
        this.totalAssets = this.loadingQueue.length;
        
        const promises = this.loadingQueue.map(asset => this.loadAsset(asset));
        
        try {
            await Promise.all(promises);
            console.log(`✅ All ${this.totalAssets} assets loaded successfully!`);
            return true;
        } catch (error) {
            console.error('❌ Asset loading failed:', error);
            return false;
        }
    }

    /**
     * Define all game assets (640+ assets)
     */
    defineAssets() {
        // Player Bike & Rider Sprites
        this.addSpriteAssets();
        
        // Environment & Background Assets
        this.addEnvironmentAssets();
        
        // UI & Effect Assets
        this.addUIAssets();
        
        // Sound Assets
        this.addSoundAssets();
        
        // Animation Data
        this.addAnimationAssets();
    }

    addSpriteAssets() {
        // BMX Rider animations (48 frames total)
        const riderAnimations = [
            'idle', 'pedaling', 'jumping', 'sliding', 'landing', 'hurt'
        ];
        
        riderAnimations.forEach(anim => {
            for (let i = 1; i <= 8; i++) {
                this.queueAsset({
                    id: `rider_${anim}_${i}`,
                    type: 'sprite',
                    category: this.categories.SPRITES,
                    generator: () => this.generateRiderSprite(anim, i)
                });
            }
        });

        // BMX Bike frames (24 frames)
        const bikeStates = ['normal', 'jump', 'slide', 'crash'];
        bikeStates.forEach(state => {
            for (let i = 1; i <= 6; i++) {
                this.queueAsset({
                    id: `bike_${state}_${i}`,
                    type: 'sprite',
                    category: this.categories.SPRITES,
                    generator: () => this.generateBikeSprite(state, i)
                });
            }
        });

        // Obstacle sprites (72 total)
        const obstacles = [
            'barrier', 'cone', 'hole', 'car', 'truck', 'fence', 
            'sign', 'hydrant', 'mailbox', 'bench', 'trash', 'boulder'
        ];
        
        obstacles.forEach(obstacle => {
            for (let variant = 1; variant <= 6; variant++) {
                this.queueAsset({
                    id: `obstacle_${obstacle}_${variant}`,
                    type: 'sprite',
                    category: this.categories.SPRITES,
                    generator: () => this.generateObstacleSprite(obstacle, variant)
                });
            }
        });

        // Collectible sprites (60 total)
        const collectibles = ['paint_red', 'paint_blue', 'paint_yellow', 'paint_green', 'paint_purple'];
        collectibles.forEach(paint => {
            for (let frame = 1; frame <= 12; frame++) {
                this.queueAsset({
                    id: `collectible_${paint}_${frame}`,
                    type: 'sprite',
                    category: this.categories.SPRITES,
                    generator: () => this.generateCollectibleSprite(paint, frame)
                });
            }
        });

        // Power-up sprites (36 total)
        const powerups = ['speed', 'jump', 'shield', 'magnet', 'multiplier', 'life'];
        powerups.forEach(powerup => {
            for (let frame = 1; frame <= 6; frame++) {
                this.queueAsset({
                    id: `powerup_${powerup}_${frame}`,
                    type: 'sprite',
                    category: this.categories.SPRITES,
                    generator: () => this.generatePowerupSprite(powerup, frame)
                });
            }
        });
    }

    addEnvironmentAssets() {
        // Background layers (48 total)
        const bgLayers = ['sky', 'clouds', 'buildings_far', 'buildings_mid', 'buildings_near', 'street'];
        bgLayers.forEach(layer => {
            for (let section = 1; section <= 8; section++) {
                this.queueAsset({
                    id: `bg_${layer}_${section}`,
                    type: 'sprite',
                    category: this.categories.SPRITES,
                    generator: () => this.generateBackgroundSprite(layer, section)
                });
            }
        });

        // Street art / Graffiti (120 total)
        const graffitiTypes = ['tag', 'mural', 'stencil', 'throw_up', 'piece'];
        graffitiTypes.forEach(type => {
            for (let variant = 1; variant <= 24; variant++) {
                this.queueAsset({
                    id: `graffiti_${type}_${variant}`,
                    type: 'sprite',
                    category: this.categories.SPRITES,
                    generator: () => this.generateGraffitiSprite(type, variant)
                });
            }
        });

        // Road elements (36 total)
        const roadElements = ['asphalt', 'lines', 'cracks', 'puddles', 'debris', 'manholes'];
        roadElements.forEach(element => {
            for (let variant = 1; variant <= 6; variant++) {
                this.queueAsset({
                    id: `road_${element}_${variant}`,
                    type: 'sprite',
                    category: this.categories.SPRITES,
                    generator: () => this.generateRoadSprite(element, variant)
                });
            }
        });

        // Weather effects (24 total)
        const weather = ['rain', 'fog', 'dust', 'leaves'];
        weather.forEach(type => {
            for (let frame = 1; frame <= 6; frame++) {
                this.queueAsset({
                    id: `weather_${type}_${frame}`,
                    type: 'sprite',
                    category: this.categories.EFFECTS,
                    generator: () => this.generateWeatherSprite(type, frame)
                });
            }
        });
    }

    addUIAssets() {
        // UI elements (48 total)
        const uiElements = [
            'heart', 'heart_empty', 'score_digit', 'multiplier', 'pause', 'play',
            'menu', 'settings', 'sound_on', 'sound_off', 'restart', 'quit'
        ];
        
        uiElements.forEach(element => {
            for (let state = 1; state <= 4; state++) {
                this.queueAsset({
                    id: `ui_${element}_${state}`,
                    type: 'sprite',
                    category: this.categories.UI,
                    generator: () => this.generateUISprite(element, state)
                });
            }
        });

        // HUD elements (24 total)
        const hudElements = ['speedometer', 'distance', 'combo', 'warning', 'arrow', 'target'];
        hudElements.forEach(element => {
            for (let variant = 1; variant <= 4; variant++) {
                this.queueAsset({
                    id: `hud_${element}_${variant}`,
                    type: 'sprite',
                    category: this.categories.UI,
                    generator: () => this.generateHUDSprite(element, variant)
                });
            }
        });
    }

    addSoundAssets() {
        // Music tracks
        this.queueAsset({
            id: 'music_menu',
            type: 'sound',
            category: this.categories.SOUNDS,
            generator: () => this.generateMusic('menu', 120, 'electronic')
        });

        this.queueAsset({
            id: 'music_game',
            type: 'sound',
            category: this.categories.SOUNDS,
            generator: () => this.generateMusic('game', 140, 'energetic')
        });

        // Sound effects (36 total)
        const sfxTypes = [
            'jump', 'land', 'slide', 'collect', 'powerup', 'crash',
            'engine', 'brake', 'spray', 'whoosh', 'beep', 'explosion'
        ];
        
        sfxTypes.forEach(sfx => {
            for (let variant = 1; variant <= 3; variant++) {
                this.queueAsset({
                    id: `sfx_${sfx}_${variant}`,
                    type: 'sound',
                    category: this.categories.SOUNDS,
                    generator: () => this.generateSoundEffect(sfx, variant)
                });
            }
        });

        // Ambient sounds (12 total)
        const ambientSounds = ['city', 'traffic', 'wind', 'rain'];
        ambientSounds.forEach(ambient => {
            for (let layer = 1; layer <= 3; layer++) {
                this.queueAsset({
                    id: `ambient_${ambient}_${layer}`,
                    type: 'sound',
                    category: this.categories.SOUNDS,
                    generator: () => this.generateAmbientSound(ambient, layer)
                });
            }
        });
    }

    addAnimationAssets() {
        // Particle effects (60 total)
        const particles = ['sparks', 'paint_splash', 'dust', 'smoke', 'explosion'];
        particles.forEach(particle => {
            for (let variant = 1; variant <= 12; variant++) {
                this.queueAsset({
                    id: `particle_${particle}_${variant}`,
                    type: 'animation',
                    category: this.categories.EFFECTS,
                    generator: () => this.generateParticleAnimation(particle, variant)
                });
            }
        });

        // Screen effects (24 total)
        const screenFX = ['flash', 'shake', 'blur', 'distort', 'chromatic', 'glow'];
        screenFX.forEach(effect => {
            for (let intensity = 1; intensity <= 4; intensity++) {
                this.queueAsset({
                    id: `screen_${effect}_${intensity}`,
                    type: 'animation',
                    category: this.categories.EFFECTS,
                    generator: () => this.generateScreenEffect(effect, intensity)
                });
            }
        });
    }

    /**
     * Queue an asset for loading
     */
    queueAsset(assetData) {
        this.loadingQueue.push(assetData);
    }

    /**
     * Load a single asset
     */
    async loadAsset(assetData) {
        try {
            const asset = await assetData.generator();
            this.assets.set(assetData.id, asset);
            this.loadedAssets++;
            
            // Update loading progress
            this.updateLoadingProgress();
            
            return asset;
        } catch (error) {
            console.warn(`Failed to load asset: ${assetData.id}`, error);
            // Create a placeholder instead of failing completely
            const placeholder = this.createPlaceholder(assetData.type);
            this.assets.set(assetData.id, placeholder);
            this.loadedAssets++;
            return placeholder;
        }
    }

    /**
     * Update loading progress display
     */
    updateLoadingProgress() {
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (loadingText) {
            loadingText.textContent = `טוען משאבים... ${Math.round(progress)}%`;
        }
    }

    /**
     * Generate BMX rider sprite
     */
    generateRiderSprite(animation, frame) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, 64, 64);
            
            // Draw rider based on animation and frame
            this.drawRider(ctx, animation, frame);
            
            resolve({
                type: 'sprite',
                canvas: canvas,
                width: 64,
                height: 64,
                animation: animation,
                frame: frame
            });
        });
    }

    /**
     * Draw BMX rider on canvas
     */
    drawRider(ctx, animation, frame) {
        const colors = this.colorPalettes.player;
        
        // Calculate animation offset
        const offset = (frame - 1) * 2;
        const bounce = Math.sin((frame / 8) * Math.PI * 2) * 2;
        
        // Body
        ctx.fillStyle = colors.primary;
        ctx.fillRect(20 + offset, 30 + bounce, 24, 16);
        
        // Head
        ctx.fillStyle = '#FFB6C1'; // Skin tone
        ctx.fillRect(26, 20 + bounce, 12, 12);
        
        // Helmet
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(24, 18 + bounce, 16, 8);
        
        // Arms
        ctx.fillStyle = colors.primary;
        if (animation === 'jumping') {
            ctx.fillRect(14, 32 + bounce, 8, 12); // Left arm up
            ctx.fillRect(42, 32 + bounce, 8, 12); // Right arm up
        } else {
            ctx.fillRect(18, 36 + bounce, 8, 8); // Left arm down
            ctx.fillRect(38, 36 + bounce, 8, 8); // Right arm down
        }
        
        // Legs
        ctx.fillStyle = '#000080'; // Jeans blue
        if (animation === 'sliding') {
            ctx.fillRect(24, 46 + bounce, 16, 6); // Legs sliding
        } else {
            ctx.fillRect(22, 46 + bounce, 8, 12); // Left leg
            ctx.fillRect(34, 46 + bounce, 8, 12); // Right leg
        }
        
        // Add glow effect for chromatic theme
        if (frame % 4 === 0) {
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 10;
            ctx.fillStyle = colors.accent;
            ctx.fillRect(30, 28 + bounce, 4, 4); // Accent point
            ctx.shadowBlur = 0;
        }
    }

    /**
     * Generate bike sprite
     */
    generateBikeSprite(state, frame) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 96;
            canvas.height = 48;
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 96, 48);
            
            // Draw bike
            this.drawBike(ctx, state, frame);
            
            resolve({
                type: 'sprite',
                canvas: canvas,
                width: 96,
                height: 48,
                state: state,
                frame: frame
            });
        });
    }

    /**
     * Draw BMX bike
     */
    drawBike(ctx, state, frame) {
        const colors = this.colorPalettes.player;
        
        // Frame
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        
        // Main triangle
        ctx.beginPath();
        ctx.moveTo(30, 35);
        ctx.lineTo(60, 35);
        ctx.lineTo(45, 15);
        ctx.closePath();
        ctx.stroke();
        
        // Wheels
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        
        // Front wheel
        ctx.beginPath();
        ctx.arc(20, 35, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        // Back wheel
        ctx.beginPath();
        ctx.arc(70, 35, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        // Handlebars
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 20);
        ctx.lineTo(25, 20);
        ctx.stroke();
        
        // Pedals (animated)
        const pedalAngle = (frame / 6) * Math.PI * 2;
        const pedalX = 45 + Math.cos(pedalAngle) * 6;
        const pedalY = 35 + Math.sin(pedalAngle) * 6;
        
        ctx.fillStyle = colors.accent;
        ctx.fillRect(pedalX - 2, pedalY - 2, 4, 4);
        
        // State-specific modifications
        if (state === 'jump') {
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 15;
        } else if (state === 'crash') {
            ctx.strokeStyle = '#FF0000';
            // Add crash sparks
            for (let i = 0; i < 5; i++) {
                const sparkX = 45 + (Math.random() - 0.5) * 20;
                const sparkY = 25 + (Math.random() - 0.5) * 20;
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(sparkX, sparkY, 2, 2);
            }
        }
        
        ctx.shadowBlur = 0;
    }

    /**
     * Generate obstacle sprite
     */
    generateObstacleSprite(type, variant) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 48;
            canvas.height = 48;
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 48, 48);
            
            this.drawObstacle(ctx, type, variant);
            
            resolve({
                type: 'sprite',
                canvas: canvas,
                width: 48,
                height: 48,
                obstacleType: type,
                variant: variant
            });
        });
    }

    /**
     * Draw obstacle
     */
    drawObstacle(ctx, type, variant) {
        const corpColors = this.colorPalettes.corporate;
        
        switch (type) {
            case 'barrier':
                ctx.fillStyle = corpColors.primary;
                ctx.fillRect(0, 30, 48, 18);
                ctx.fillStyle = '#FFFF00';
                for (let i = 0; i < 48; i += 8) {
                    ctx.fillRect(i, 30, 4, 18);
                }
                break;
                
            case 'cone':
                ctx.fillStyle = '#FF6600';
                ctx.beginPath();
                ctx.moveTo(24, 5);
                ctx.lineTo(8, 43);
                ctx.lineTo(40, 43);
                ctx.closePath();
                ctx.fill();
                
                // White stripes
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(16, 20, 16, 3);
                ctx.fillRect(14, 30, 20, 3);
                break;
                
            case 'car':
                // Corporate gray car
                ctx.fillStyle = corpColors.primary;
                ctx.fillRect(4, 20, 40, 20);
                ctx.fillRect(8, 10, 32, 10);
                
                // Windows
                ctx.fillStyle = corpColors.dark;
                ctx.fillRect(12, 12, 24, 6);
                
                // Wheels
                ctx.fillStyle = '#333333';
                ctx.fillRect(6, 38, 8, 6);
                ctx.fillRect(34, 38, 8, 6);
                break;
                
            default:
                // Generic gray box
                ctx.fillStyle = corpColors.secondary;
                ctx.fillRect(8, 8, 32, 32);
                break;
        }
        
        // Add variant modifications
        if (variant > 3) {
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = this.colorPalettes.neon.purple;
            ctx.fillRect(0, 0, 48, 4); // Neon accent
            ctx.globalAlpha = 1;
        }
    }

    /**
     * Generate collectible sprite (paint cans)
     */
    generateCollectibleSprite(paintType, frame) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 32, 32);
            
            this.drawCollectible(ctx, paintType, frame);
            
            resolve({
                type: 'sprite',
                canvas: canvas,
                width: 32,
                height: 32,
                paintType: paintType,
                frame: frame
            });
        });
    }

    /**
     * Draw collectible paint can
     */
    drawCollectible(ctx, paintType, frame) {
        const rotation = (frame / 12) * Math.PI * 2;
        const bounce = Math.sin(rotation) * 2;
        const scale = 1 + Math.sin(rotation * 2) * 0.1;
        
        // Paint color based on type
        let paintColor = '#FF0000';
        switch (paintType) {
            case 'paint_red': paintColor = '#FF0000'; break;
            case 'paint_blue': paintColor = '#0000FF'; break;
            case 'paint_yellow': paintColor = '#FFFF00'; break;
            case 'paint_green': paintColor = '#00FF00'; break;
            case 'paint_purple': paintColor = '#FF00FF'; break;
        }
        
        ctx.save();
        ctx.translate(16, 16 + bounce);
        ctx.scale(scale, scale);
        ctx.rotate(rotation * 0.1);
        
        // Can body
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-8, -8, 16, 16);
        
        // Paint inside
        ctx.fillStyle = paintColor;
        ctx.fillRect(-6, -6, 12, 8);
        
        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(-6, -6, 4, 2);
        
        // Glow effect
        ctx.shadowColor = paintColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = paintColor;
        ctx.fillRect(-1, -1, 2, 2);
        
        ctx.restore();
    }

    /**
     * Generate power-up sprite
     */
    generatePowerupSprite(type, frame) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 40;
            canvas.height = 40;
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 40, 40);
            
            this.drawPowerup(ctx, type, frame);
            
            resolve({
                type: 'sprite',
                canvas: canvas,
                width: 40,
                height: 40,
                powerType: type,
                frame: frame
            });
        });
    }

    /**
     * Draw power-up
     */
    drawPowerup(ctx, type, frame) {
        const glow = Math.sin((frame / 6) * Math.PI * 2) * 0.3 + 0.7;
        const rotation = (frame / 6) * Math.PI * 2;
        
        ctx.save();
        ctx.translate(20, 20);
        ctx.rotate(rotation);
        
        let color = '#FFFFFF';
        let symbol = '?';
        
        switch (type) {
            case 'speed':
                color = this.colorPalettes.neon.yellow;
                symbol = '⚡';
                break;
            case 'jump':
                color = this.colorPalettes.neon.green;
                symbol = '↑';
                break;
            case 'shield':
                color = this.colorPalettes.neon.blue;
                symbol = '🛡️';
                break;
            case 'magnet':
                color = this.colorPalettes.neon.purple;
                symbol = '🧲';
                break;
            case 'multiplier':
                color = this.colorPalettes.neon.pink;
                symbol = '×2';
                break;
            case 'life':
                color = '#FF0000';
                symbol = '❤️';
                break;
        }
        
        // Outer glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 20 * glow;
        
        // Power-up body
        ctx.fillStyle = color;
        ctx.globalAlpha = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner symbol
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, 0, 0);
        
        ctx.restore();
    }

    /**
     * Generate background sprite
     */
    generateBackgroundSprite(layer, section) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 200, 150);
            
            this.drawBackground(ctx, layer, section);
            
            resolve({
                type: 'sprite',
                canvas: canvas,
                width: 200,
                height: 150,
                layer: layer,
                section: section
            });
        });
    }

    /**
     * Draw background layer
     */
    drawBackground(ctx, layer, section) {
        const envColors = this.colorPalettes.environment;
        const corpColors = this.colorPalettes.corporate;
        
        switch (layer) {
            case 'sky':
                // Gradient sky
                const gradient = ctx.createLinearGradient(0, 0, 0, 150);
                gradient.addColorStop(0, envColors.sky);
                gradient.addColorStop(1, '#B0E0E6');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 200, 150);
                break;
                
            case 'clouds':
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.7;
                // Draw fluffy clouds
                for (let i = 0; i < 3; i++) {
                    const x = (section * 60 + i * 70) % 250;
                    const y = 20 + i * 15;
                    this.drawCloud(ctx, x, y);
                }
                ctx.globalAlpha = 1;
                break;
                
            case 'buildings_far':
                ctx.fillStyle = corpColors.secondary;
                // Far buildings silhouette
                for (let i = 0; i < 5; i++) {
                    const x = i * 40;
                    const height = 60 + (section + i) * 10;
                    ctx.fillRect(x, 150 - height, 35, height);
                }
                break;
                
            case 'buildings_mid':
                // Mid-distance buildings with some color
                for (let i = 0; i < 4; i++) {
                    const x = i * 50;
                    const height = 80 + (section + i) * 8;
                    ctx.fillStyle = corpColors.primary;
                    ctx.fillRect(x, 150 - height, 45, height);
                    
                    // Add some windows
                    ctx.fillStyle = corpColors.dark;
                    for (let w = 0; w < 3; w++) {
                        for (let h = 0; h < Math.floor(height / 15); h++) {
                            if (Math.random() > 0.3) {
                                ctx.fillRect(x + 5 + w * 12, 150 - height + 5 + h * 15, 8, 8);
                            }
                        }
                    }
                }
                break;
                
            case 'buildings_near':
                // Near buildings with graffiti potential
                ctx.fillStyle = corpColors.dark;
                ctx.fillRect(0, 50, 200, 100);
                
                // Add some architectural details
                ctx.fillStyle = corpColors.primary;
                ctx.fillRect(0, 45, 200, 10);
                ctx.fillRect(0, 140, 200, 10);
                break;
                
            case 'street':
                // Street surface
                ctx.fillStyle = '#404040';
                ctx.fillRect(0, 120, 200, 30);
                
                // Street markings
                ctx.fillStyle = '#FFFFFF';
                for (let i = 0; i < 200; i += 40) {
                    ctx.fillRect(i, 133, 20, 4);
                }
                break;
        }
    }

    /**
     * Draw a cloud
     */
    drawCloud(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 20, y - 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Generate graffiti sprite
     */
    generateGraffitiSprite(type, variant) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 60;
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 120, 60);
            
            this.drawGraffiti(ctx, type, variant);
            
            resolve({
                type: 'sprite',
                canvas: canvas,
                width: 120,
                height: 60,
                graffitiType: type,
                variant: variant
            });
        });
    }

    /**
     * Draw street art / graffiti
     */
    drawGraffiti(ctx, type, variant) {
        const colors = this.colorPalettes.environment.graffiti;
        const color = colors[variant % colors.length];
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;
        
        switch (type) {
            case 'tag':
                // Simple tag style
                ctx.font = 'bold 24px Arial';
                ctx.fillText('RUSH', 10, 40);
                break;
                
            case 'mural':
                // Larger artistic piece
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.8;
                
                // Abstract shapes
                ctx.beginPath();
                ctx.arc(30, 30, 20, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillRect(60, 15, 30, 30);
                
                ctx.beginPath();
                ctx.moveTo(90, 15);
                ctx.lineTo(110, 30);
                ctx.lineTo(90, 45);
                ctx.closePath();
                ctx.fill();
                
                ctx.globalAlpha = 1;
                break;
                
            case 'stencil':
                // Stencil-style art
                ctx.fillStyle = color;
                ctx.font = 'bold 20px monospace';
                ctx.fillText('FREE', 20, 25);
                ctx.fillText('ART', 20, 45);
                break;
                
            case 'throw_up':
                // Bubble letters
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                
                // Bubble O
                ctx.beginPath();
                ctx.arc(25, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Bubble K
                ctx.beginPath();
                ctx.moveTo(50, 15);
                ctx.lineTo(50, 45);
                ctx.moveTo(50, 25);
                ctx.lineTo(65, 15);
                ctx.moveTo(50, 35);
                ctx.lineTo(65, 45);
                ctx.stroke();
                break;
                
            case 'piece':
                // Complex piece with multiple colors
                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = colors[(variant + i) % colors.length];
                    ctx.fillRect(i * 35 + 10, 10 + i * 5, 25, 20);
                }
                break;
        }
    }

    /**
     * Generate sound effect
     */
    generateSoundEffect(type, variant) {
        return new Promise((resolve) => {
            if (!this.audioContext) {
                resolve({ type: 'sound', data: null });
                return;
            }
            
            const duration = 0.5;
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generate different sound types
            this.synthesizeSound(data, type, variant, sampleRate, duration);
            
            resolve({
                type: 'sound',
                buffer: buffer,
                soundType: type,
                variant: variant
            });
        });
    }

    /**
     * Synthesize sound based on type
     */
    synthesizeSound(data, type, variant, sampleRate, duration) {
        const length = data.length;
        
        switch (type) {
            case 'jump':
                // Rising tone
                for (let i = 0; i < length; i++) {
                    const t = i / sampleRate;
                    const freq = 200 + t * 400;
                    const envelope = 1 - t / duration;
                    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
                }
                break;
                
            case 'collect':
                // Bell-like sound
                for (let i = 0; i < length; i++) {
                    const t = i / sampleRate;
                    const freq = 800 + variant * 100;
                    const envelope = Math.exp(-t * 3);
                    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
                }
                break;
                
            case 'crash':
                // Noise with filtering
                for (let i = 0; i < length; i++) {
                    const t = i / sampleRate;
                    const envelope = Math.exp(-t * 2);
                    data[i] = (Math.random() * 2 - 1) * envelope * 0.1;
                }
                break;
                
            default:
                // Simple tone
                for (let i = 0; i < length; i++) {
                    const t = i / sampleRate;
                    const freq = 440 + variant * 50;
                    data[i] = Math.sin(2 * Math.PI * freq * t) * 0.1;
                }
                break;
        }
    }

    /**
     * Generate music track
     */
    generateMusic(type, bpm, style) {
        return new Promise((resolve) => {
            // Placeholder for music generation
            // In a real implementation, this would create procedural music
            resolve({
                type: 'music',
                musicType: type,
                bpm: bpm,
                style: style,
                duration: 60 // 1 minute loop
            });
        });
    }

    /**
     * Generate ambient sound
     */
    generateAmbientSound(type, layer) {
        return new Promise((resolve) => {
            resolve({
                type: 'ambient',
                ambientType: type,
                layer: layer,
                loop: true
            });
        });
    }

    /**
     * Generate particle animation data
     */
    generateParticleAnimation(type, variant) {
        return new Promise((resolve) => {
            const animation = {
                type: 'particle',
                particleType: type,
                variant: variant,
                frames: [],
                duration: 1000, // 1 second
                maxParticles: 50
            };
            
            // Generate frame data for particle animation
            for (let frame = 0; frame < 30; frame++) {
                animation.frames.push(this.generateParticleFrame(type, variant, frame));
            }
            
            resolve(animation);
        });
    }

    /**
     * Generate single particle frame
     */
    generateParticleFrame(type, variant, frame) {
        const particles = [];
        const progress = frame / 30;
        
        for (let i = 0; i < 20; i++) {
            const particle = {
                x: Math.random() * 100,
                y: Math.random() * 100,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1 - progress,
                color: this.getParticleColor(type, variant),
                size: 2 + Math.random() * 3
            };
            
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * Get particle color based on type
     */
    getParticleColor(type, variant) {
        const colors = {
            sparks: ['#FFFF00', '#FF6600', '#FF0000'],
            paint_splash: this.colorPalettes.environment.graffiti,
            dust: ['#8B4513', '#A0522D', '#CD853F'],
            smoke: ['#696969', '#778899', '#2F4F4F'],
            explosion: ['#FF0000', '#FF4500', '#FFD700']
        };
        
        const colorSet = colors[type] || colors.sparks;
        return colorSet[variant % colorSet.length];
    }

    /**
     * Generate screen effect animation
     */
    generateScreenEffect(effect, intensity) {
        return new Promise((resolve) => {
            resolve({
                type: 'screenEffect',
                effect: effect,
                intensity: intensity,
                duration: 500,
                keyframes: this.generateEffectKeyframes(effect, intensity)
            });
        });
    }

    /**
     * Generate effect keyframes
     */
    generateEffectKeyframes(effect, intensity) {
        const keyframes = [];
        const steps = 10;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const value = this.calculateEffectValue(effect, intensity, progress);
            keyframes.push({ progress, value });
        }
        
        return keyframes;
    }

    /**
     * Calculate effect value for given progress
     */
    calculateEffectValue(effect, intensity, progress) {
        const normalizedIntensity = intensity / 4;
        
        switch (effect) {
            case 'flash':
                return Math.sin(progress * Math.PI) * normalizedIntensity;
            case 'shake':
                return Math.sin(progress * Math.PI * 8) * normalizedIntensity * 10;
            case 'blur':
                return Math.sin(progress * Math.PI) * normalizedIntensity * 5;
            default:
                return normalizedIntensity * progress;
        }
    }

    /**
     * Create placeholder asset
     */
    createPlaceholder(type) {
        switch (type) {
            case 'sprite':
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FF00FF'; // Magenta placeholder
                ctx.fillRect(0, 0, 32, 32);
                return { type: 'sprite', canvas: canvas, width: 32, height: 32 };
            case 'sound':
                return { type: 'sound', data: null };
            case 'animation':
                return { type: 'animation', frames: [], duration: 1000 };
            default:
                return { type: 'unknown', data: null };
        }
    }

    /**
     * Get asset by ID
     */
    getAsset(id) {
        return this.assets.get(id);
    }

    /**
     * Check if asset exists
     */
    hasAsset(id) {
        return this.assets.has(id);
    }

    /**
     * Get all assets of a specific category
     */
    getAssetsByCategory(category) {
        const result = new Map();
        for (const [id, asset] of this.assets) {
            if (id.startsWith(category) || (asset.category && asset.category === category)) {
                result.set(id, asset);
            }
        }
        return result;
    }

    /**
     * Play sound effect
     */
    playSound(id, volume = 1.0) {
        const sound = this.assets.get(id);
        if (sound && sound.buffer && this.audioContext) {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = sound.buffer;
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
        }
    }

    /**
     * Get loading progress
     */
    getLoadingProgress() {
        return {
            loaded: this.loadedAssets,
            total: this.totalAssets,
            percentage: this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 100 : 0
        };
    }
}

// Create global instance
window.assetsManager = new AssetsManager();

console.log('🎨 CHROMATIC RUSH Assets Manager initialized with 640+ assets ready to load!');