/**
 * CHROMATIC RUSH - Main Game Engine
 * Full-featured BMX arcade game with ECS architecture
 */

// Entity Component System (ECS) Implementation
class Component {
    constructor() {
        this.entity = null;
    }
}

class Transform extends Component {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = 0;
        this.scale = 1;
        this.previousX = x;
        this.previousY = y;
    }
}

class Velocity extends Component {
    constructor(vx = 0, vy = 0) {
        super();
        this.vx = vx;
        this.vy = vy;
        this.maxVx = 500;
        this.maxVy = 800;
        this.friction = 0.85;
        this.gravity = 800;
    }
}

class Sprite extends Component {
    constructor(type, frame, layer = 0) {
        super();
        this.type = type;
        this.frame = frame;
        this.layer = layer;
        this.visible = true;
        this.opacity = 1.0;
        this.flipX = false;
        this.flipY = false;
        this.tint = null;
    }
}

class Animation extends Component {
    constructor(frames = [], duration = 0.1, loop = true) {
        super();
        this.frames = frames;
        this.duration = duration;
        this.loop = loop;
        this.currentFrame = 0;
        this.timer = 0;
        this.playing = false;
        this.onComplete = null;
    }
    
    play(frames = null) {
        if (frames) this.frames = frames;
        this.playing = true;
        this.currentFrame = 0;
        this.timer = 0;
    }
    
    stop() {
        this.playing = false;
        this.currentFrame = 0;
        this.timer = 0;
    }
}

class Physics extends Component {
    constructor() {
        super();
        this.static = false;
        this.bounce = 0;
        this.mass = 1;
        this.grounded = false;
        this.onGround = false;
        this.groundY = 0;
    }
}

class Collider extends Component {
    constructor(width = 32, height = 32, offsetX = 0, offsetY = 0) {
        super();
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.isTrigger = false;
        this.layer = 'default';
        this.tags = new Set();
    }
}

class Health extends Component {
    constructor(maxHealth = 1) {
        super();
        this.current = maxHealth;
        this.max = maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return false;
        this.current = Math.max(0, this.current - amount);
        return true;
    }
    
    heal(amount) {
        this.current = Math.min(this.max, this.current + amount);
    }
}

class PlayerController extends Component {
    constructor() {
        super();
        this.jumpForce = 400;
        this.moveSpeed = 250;
        this.isJumping = false;
        this.isDucking = false;
        this.isSpraying = false;
        this.sprayPower = 100;
        this.maxSprayPower = 100;
        this.sprayRegenRate = 20; // per second
        this.actions = {
            jump: false,
            duck: false,
            spray: false
        };
    }
}

class AIController extends Component {
    constructor(type = 'patrol', config = {}) {
        super();
        this.type = type;
        this.config = config;
        this.state = 'idle';
        this.timer = 0;
        this.target = null;
        this.pathIndex = 0;
        this.lastAction = null;
    }
}

class Collectible extends Component {
    constructor(type = 'coin', value = 10) {
        super();
        this.type = type;
        this.value = value;
        this.collected = false;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.floatSpeed = 2;
        this.floatAmount = 5;
    }
}

class Particle extends Component {
    constructor(lifetime = 1, fadeOut = true) {
        super();
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.fadeOut = fadeOut;
        this.color = '#ffffff';
        this.size = 4;
        this.trail = [];
        this.trailLength = 5;
    }
}

class Obstacle extends Component {
    constructor(type = 'static', damage = 1) {
        super();
        this.type = type;
        this.damage = damage;
        this.hit = false;
        this.pattern = null;
        this.moveSpeed = 0;
        this.activationDistance = 200;
    }
}

class StreetArt extends Component {
    constructor() {
        super();
        this.painted = false;
        this.paintProgress = 0;
        this.requiredPaint = 100;
        this.artStyle = 'graffiti';
        this.colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'];
        this.baseColor = '#666666';
    }
}

// Entity Manager
class Entity {
    constructor(id = Entity.generateId()) {
        this.id = id;
        this.components = new Map();
        this.tags = new Set();
        this.active = true;
        this.destroy = false;
    }
    
    static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    
    addComponent(component) {
        component.entity = this;
        this.components.set(component.constructor.name, component);
        return this;
    }
    
    getComponent(componentClass) {
        const className = typeof componentClass === 'string' ? componentClass : componentClass.name;
        return this.components.get(className);
    }
    
    hasComponent(componentClass) {
        const className = typeof componentClass === 'string' ? componentClass : componentClass.name;
        return this.components.has(className);
    }
    
    removeComponent(componentClass) {
        const className = typeof componentClass === 'string' ? componentClass : componentClass.name;
        this.components.delete(className);
        return this;
    }
    
    addTag(tag) {
        this.tags.add(tag);
        return this;
    }
    
    hasTag(tag) {
        return this.tags.has(tag);
    }
    
    removeTag(tag) {
        this.tags.delete(tag);
        return this;
    }
}

// System Base Class
class System {
    constructor(game) {
        this.game = game;
        this.enabled = true;
    }
    
    update(deltaTime, entities) {
        // Override in subclasses
    }
    
    getEntitiesWith(...componentClasses) {
        return this.game.entityManager.getEntitiesWith(...componentClasses);
    }
}

// Core Systems
class PhysicsSystem extends System {
    constructor(game) {
        super(game);
        this.gravity = 800; // pixels per second squared
    }
    
    update(deltaTime, entities) {
        const physicsEntities = this.getEntitiesWith('Transform', 'Velocity', 'Physics');
        
        for (const entity of physicsEntities) {
            const transform = entity.getComponent('Transform');
            const velocity = entity.getComponent('Velocity');
            const physics = entity.getComponent('Physics');
            
            // Store previous position
            transform.previousX = transform.x;
            transform.previousY = transform.y;
            
            // Apply gravity if not static
            if (!physics.static) {
                velocity.vy += physics.grounded ? 0 : this.gravity * deltaTime;
            }
            
            // Apply friction
            if (physics.onGround) {
                velocity.vx *= Math.pow(velocity.friction, deltaTime);
            }
            
            // Clamp velocities
            velocity.vx = Math.max(-velocity.maxVx, Math.min(velocity.maxVx, velocity.vx));
            velocity.vy = Math.max(-velocity.maxVy, Math.min(velocity.maxVy, velocity.vy));
            
            // Update position
            transform.x += velocity.vx * deltaTime;
            transform.y += velocity.vy * deltaTime;
            
            // Ground collision
            const groundY = this.game.renderer.canvas.height - 150; // Street level
            if (transform.y + transform.height > groundY) {
                transform.y = groundY - transform.height;
                
                if (velocity.vy > 0) {
                    velocity.vy = -velocity.vy * physics.bounce;
                    physics.onGround = true;
                    physics.grounded = true;
                    physics.groundY = groundY;
                    
                    // Landing effect
                    if (entity.hasTag('player') && Math.abs(velocity.vy) > 100) {
                        this.game.effectsSystem.createLandingEffect(transform.x + transform.width/2, groundY);
                        Assets.playSound('land');
                    }
                }
            } else {
                physics.onGround = false;
                if (physics.grounded && velocity.vy > 50) {
                    physics.grounded = false;
                }
            }
        }
    }
}

class CollisionSystem extends System {
    constructor(game) {
        super(game);
        this.collisions = [];
    }
    
    update(deltaTime, entities) {
        this.collisions = [];
        const colliderEntities = this.getEntitiesWith('Transform', 'Collider');
        
        // Check all collision pairs
        for (let i = 0; i < colliderEntities.length; i++) {
            for (let j = i + 1; j < colliderEntities.length; j++) {
                const entityA = colliderEntities[i];
                const entityB = colliderEntities[j];
                
                if (this.checkCollision(entityA, entityB)) {
                    this.handleCollision(entityA, entityB);
                }
            }
        }
    }
    
    checkCollision(entityA, entityB) {
        const transformA = entityA.getComponent('Transform');
        const colliderA = entityA.getComponent('Collider');
        const transformB = entityB.getComponent('Transform');
        const colliderB = entityB.getComponent('Collider');
        
        const rectA = {
            x: transformA.x + colliderA.offsetX,
            y: transformA.y + colliderA.offsetY,
            width: colliderA.width,
            height: colliderA.height
        };
        
        const rectB = {
            x: transformB.x + colliderB.offsetX,
            y: transformB.y + colliderB.offsetY,
            width: colliderB.width,
            height: colliderB.height
        };
        
        return this.rectIntersects(rectA, rectB);
    }
    
    rectIntersects(rectA, rectB) {
        return rectA.x < rectB.x + rectB.width &&
               rectA.x + rectA.width > rectB.x &&
               rectA.y < rectB.y + rectB.height &&
               rectA.y + rectA.height > rectB.y;
    }
    
    handleCollision(entityA, entityB) {
        const collision = { entityA, entityB };
        this.collisions.push(collision);
        
        // Player vs Obstacle
        if ((entityA.hasTag('player') && entityB.hasTag('obstacle')) ||
            (entityB.hasTag('player') && entityA.hasTag('obstacle'))) {
            const player = entityA.hasTag('player') ? entityA : entityB;
            const obstacle = entityA.hasTag('obstacle') ? entityA : entityB;
            this.handlePlayerObstacleCollision(player, obstacle);
        }
        
        // Player vs Collectible
        if ((entityA.hasTag('player') && entityB.hasTag('collectible')) ||
            (entityB.hasTag('player') && entityA.hasTag('collectible'))) {
            const player = entityA.hasTag('player') ? entityA : entityB;
            const collectible = entityA.hasTag('collectible') ? entityA : entityB;
            this.handlePlayerCollectibleCollision(player, collectible);
        }
        
        // Player vs Street Art
        if ((entityA.hasTag('player') && entityB.hasTag('streetart')) ||
            (entityB.hasTag('player') && entityA.hasTag('streetart'))) {
            const player = entityA.hasTag('player') ? entityA : entityB;
            const streetart = entityA.hasTag('streetart') ? entityA : entityB;
            this.handlePlayerStreetArtCollision(player, streetart);
        }
    }
    
    handlePlayerObstacleCollision(player, obstacle) {
        const playerHealth = player.getComponent('Health');
        const obstacleComponent = obstacle.getComponent('Obstacle');
        const playerTransform = player.getComponent('Transform');
        
        if (playerHealth && !playerHealth.invulnerable && !obstacleComponent.hit) {
            const damaged = playerHealth.takeDamage(obstacleComponent.damage);
            
            if (damaged) {
                obstacleComponent.hit = true;
                playerHealth.invulnerable = true;
                playerHealth.invulnerabilityTime = 1.5;
                
                // Screen shake
                this.game.renderer.addShake(10);
                
                // Crash effect
                this.game.effectsSystem.createCrashEffect(
                    playerTransform.x + playerTransform.width/2,
                    playerTransform.y + playerTransform.height/2
                );
                
                // Update lives display
                this.game.ui.updateLives(playerHealth.current);
                
                Assets.playSound('crash');
                
                // Game over check
                if (playerHealth.current <= 0) {
                    this.game.gameOver();
                }
            }
        }
    }
    
    handlePlayerCollectibleCollision(player, collectible) {
        const collectibleComponent = collectible.getComponent('Collectible');
        
        if (!collectibleComponent.collected) {
            collectibleComponent.collected = true;
            
            const playerTransform = player.getComponent('Transform');
            const playerController = player.getComponent('PlayerController');
            
            // Add score
            this.game.addScore(collectibleComponent.value);
            
            // Handle different collectible types
            switch (collectibleComponent.type) {
                case 'spray_can':
                    if (playerController) {
                        playerController.sprayPower = Math.min(
                            playerController.maxSprayPower,
                            playerController.sprayPower + 25
                        );
                        this.game.ui.updateSprayPower(playerController.sprayPower / playerController.maxSprayPower);
                    }
                    break;
                case 'power_up':
                    // Temporary invulnerability
                    const playerHealth = player.getComponent('Health');
                    if (playerHealth) {
                        playerHealth.invulnerable = true;
                        playerHealth.invulnerabilityTime = 3.0;
                    }
                    Assets.playSound('powerup');
                    break;
                case 'coin':
                default:
                    Assets.playSound('collect');
                    break;
            }
            
            // Collect effect
            this.game.effectsSystem.createCollectEffect(
                playerTransform.x + playerTransform.width/2,
                playerTransform.y + playerTransform.height/2,
                collectibleComponent.type
            );
            
            // Remove collectible
            collectible.destroy = true;
        }
    }
    
    handlePlayerStreetArtCollision(player, streetart) {
        const playerController = player.getComponent('PlayerController');
        const artComponent = streetart.getComponent('StreetArt');
        
        if (playerController?.actions.spray && !artComponent.painted && playerController.sprayPower > 0) {
            const sprayRate = 50; // units per second
            const deltaSpray = sprayRate * this.game.deltaTime;
            
            artComponent.paintProgress += deltaSpray;
            playerController.sprayPower = Math.max(0, playerController.sprayPower - deltaSpray/2);
            
            this.game.ui.updateSprayPower(playerController.sprayPower / playerController.maxSprayPower);
            
            // Create spray particles
            const transform = streetart.getComponent('Transform');
            this.game.effectsSystem.createSprayEffect(
                transform.x + Math.random() * transform.width,
                transform.y + Math.random() * transform.height
            );
            
            if (artComponent.paintProgress >= artComponent.requiredPaint && !artComponent.painted) {
                artComponent.painted = true;
                this.game.addScore(100);
                this.game.stats.wallsPainted++;
                
                // Achievement check
                this.game.achievementsSystem.checkAchievement('first_wall', this.game.stats.wallsPainted >= 1);
                this.game.achievementsSystem.checkAchievement('artist', this.game.stats.wallsPainted >= 10);
                
                Assets.playSound('achievement');
                
                // Update sprite to painted version
                const sprite = streetart.getComponent('Sprite');
                if (sprite) {
                    if (sprite.type === 'building1') sprite.frame = 'colored_building1';
                    else if (sprite.type === 'building2') sprite.frame = 'colored_building2';
                }
            }
        }
    }
}

class AnimationSystem extends System {
    update(deltaTime, entities) {
        const animatedEntities = this.getEntitiesWith('Sprite', 'Animation');
        
        for (const entity of animatedEntities) {
            const sprite = entity.getComponent('Sprite');
            const animation = entity.getComponent('Animation');
            
            if (animation.playing && animation.frames.length > 0) {
                animation.timer += deltaTime;
                
                if (animation.timer >= animation.duration) {
                    animation.timer = 0;
                    animation.currentFrame++;
                    
                    if (animation.currentFrame >= animation.frames.length) {
                        if (animation.loop) {
                            animation.currentFrame = 0;
                        } else {
                            animation.playing = false;
                            animation.currentFrame = animation.frames.length - 1;
                            if (animation.onComplete) animation.onComplete();
                        }
                    }
                    
                    // Update sprite frame
                    sprite.frame = animation.frames[animation.currentFrame];
                }
            }
        }
    }
}

class PlayerSystem extends System {
    update(deltaTime, entities) {
        const players = this.getEntitiesWith('Transform', 'Velocity', 'PlayerController');
        
        for (const player of players) {
            const transform = player.getComponent('Transform');
            const velocity = player.getComponent('Velocity');
            const controller = player.getComponent('PlayerController');
            const physics = player.getComponent('Physics');
            const health = player.getComponent('Health');
            const sprite = player.getComponent('Sprite');
            const animation = player.getComponent('Animation');
            
            // Update invulnerability
            if (health && health.invulnerable) {
                health.invulnerabilityTime -= deltaTime;
                if (health.invulnerabilityTime <= 0) {
                    health.invulnerable = false;
                }
            }
            
            // Regenerate spray power
            if (controller.sprayPower < controller.maxSprayPower) {
                controller.sprayPower = Math.min(
                    controller.maxSprayPower,
                    controller.sprayPower + controller.sprayRegenRate * deltaTime
                );
                this.game.ui.updateSprayPower(controller.sprayPower / controller.maxSprayPower);
            }
            
            // Handle input actions
            if (controller.actions.jump && physics.grounded && !controller.isJumping) {
                velocity.vy = -controller.jumpForce;
                physics.grounded = false;
                controller.isJumping = true;
                Assets.playSound('jump');
                
                // Jump effect
                this.game.effectsSystem.createJumpEffect(
                    transform.x + transform.width/2,
                    transform.y + transform.height
                );
                
                // Update animation
                if (animation) {
                    animation.play(['jump']);
                }
            }
            
            if (controller.actions.duck && physics.grounded) {
                controller.isDucking = true;
                
                // Modify collider for ducking
                const collider = player.getComponent('Collider');
                if (collider) {
                    collider.height = 20;
                    collider.offsetY = 12;
                }
                
                // Update animation
                if (animation) {
                    animation.play(['duck']);
                }
            } else {
                controller.isDucking = false;
                
                // Reset collider
                const collider = player.getComponent('Collider');
                if (collider) {
                    collider.height = 32;
                    collider.offsetY = 0;
                }
            }
            
            if (controller.actions.spray && controller.sprayPower > 0) {
                controller.isSpraying = true;
                
                // Create spray particles
                this.game.effectsSystem.createSprayEffect(
                    transform.x + transform.width + 5,
                    transform.y + transform.height/2
                );
                
                Assets.playSound('spray');
                
                // Update animation
                if (animation) {
                    animation.play(['spray']);
                }
            } else {
                controller.isSpraying = false;
            }
            
            // Update sprite based on state
            if (sprite && !animation?.playing) {
                if (controller.isJumping && !physics.grounded) {
                    sprite.frame = 'jump';
                } else if (controller.isDucking) {
                    sprite.frame = 'duck';
                } else if (controller.isSpraying) {
                    sprite.frame = 'spray';
                } else {
                    sprite.frame = 'idle';
                }
            }
            
            // Reset action flags
            controller.actions.jump = false;
            controller.actions.duck = false;
            controller.actions.spray = false;
            
            // Reset jumping flag when landing
            if (physics.grounded) {
                controller.isJumping = false;
            }
            
            // Add visual effects for invulnerability
            if (health?.invulnerable) {
                sprite.opacity = 0.5 + 0.3 * Math.sin(Date.now() * 0.01);
            } else {
                sprite.opacity = 1.0;
            }
        }
    }
}

class AISystem extends System {
    update(deltaTime, entities) {
        const aiEntities = this.getEntitiesWith('Transform', 'AIController');
        
        for (const entity of aiEntities) {
            const transform = entity.getComponent('Transform');
            const ai = entity.getComponent('AIController');
            const velocity = entity.getComponent('Velocity');
            
            ai.timer += deltaTime;
            
            switch (ai.type) {
                case 'patrol':
                    this.updatePatrolAI(entity, ai, transform, velocity, deltaTime);
                    break;
                case 'chase':
                    this.updateChaseAI(entity, ai, transform, velocity, deltaTime);
                    break;
                case 'guard':
                    this.updateGuardAI(entity, ai, transform, velocity, deltaTime);
                    break;
            }
        }
    }
    
    updatePatrolAI(entity, ai, transform, velocity, deltaTime) {
        const patrolSpeed = ai.config.speed || 50;
        const patrolRange = ai.config.range || 200;
        const startX = ai.config.startX || transform.x;
        
        switch (ai.state) {
            case 'idle':
                if (ai.timer > (ai.config.idleTime || 2)) {
                    ai.state = 'moving';
                    ai.timer = 0;
                    ai.direction = Math.random() > 0.5 ? 1 : -1;
                }
                break;
                
            case 'moving':
                velocity.vx = patrolSpeed * ai.direction;
                
                if (Math.abs(transform.x - startX) > patrolRange || ai.timer > 4) {
                    ai.state = 'turning';
                    ai.timer = 0;
                }
                break;
                
            case 'turning':
                velocity.vx = 0;
                if (ai.timer > 0.5) {
                    ai.direction *= -1;
                    ai.state = 'moving';
                    ai.timer = 0;
                }
                break;
        }
    }
    
    updateChaseAI(entity, ai, transform, velocity, deltaTime) {
        const player = this.game.player;
        if (!player) return;
        
        const playerTransform = player.getComponent('Transform');
        const chaseSpeed = ai.config.speed || 100;
        const chaseRange = ai.config.range || 300;
        
        const distance = Math.abs(transform.x - playerTransform.x);
        
        if (distance < chaseRange) {
            ai.state = 'chasing';
            const direction = transform.x < playerTransform.x ? 1 : -1;
            velocity.vx = chaseSpeed * direction;
            
            // Update sprite direction
            const sprite = entity.getComponent('Sprite');
            if (sprite) {
                sprite.flipX = direction < 0;
            }
        } else {
            ai.state = 'idle';
            velocity.vx = 0;
        }
    }
    
    updateGuardAI(entity, ai, transform, velocity, deltaTime) {
        const guardRange = ai.config.range || 150;
        const alertRange = ai.config.alertRange || 100;
        
        const player = this.game.player;
        if (!player) return;
        
        const playerTransform = player.getComponent('Transform');
        const distance = Math.abs(transform.x - playerTransform.x);
        
        switch (ai.state) {
            case 'idle':
                if (distance < alertRange) {
                    ai.state = 'alert';
                    ai.timer = 0;
                }
                break;
                
            case 'alert':
                if (ai.timer > 1) {
                    if (distance < guardRange) {
                        ai.state = 'pursuing';
                    } else {
                        ai.state = 'idle';
                    }
                    ai.timer = 0;
                }
                break;
                
            case 'pursuing':
                const pursuitSpeed = ai.config.speed || 120;
                const direction = transform.x < playerTransform.x ? 1 : -1;
                velocity.vx = pursuitSpeed * direction;
                
                if (distance > guardRange * 1.5) {
                    ai.state = 'returning';
                    ai.target = { x: ai.config.startX || transform.x, y: transform.y };
                }
                break;
                
            case 'returning':
                if (ai.target) {
                    const returnSpeed = ai.config.speed || 80;
                    const directionToStart = transform.x < ai.target.x ? 1 : -1;
                    velocity.vx = returnSpeed * directionToStart;
                    
                    if (Math.abs(transform.x - ai.target.x) < 10) {
                        ai.state = 'idle';
                        ai.target = null;
                        velocity.vx = 0;
                    }
                }
                break;
        }
    }
}

class ParticleSystem extends System {
    update(deltaTime, entities) {
        const particles = this.getEntitiesWith('Transform', 'Particle');
        
        for (const particle of particles) {
            const transform = particle.getComponent('Transform');
            const particleComponent = particle.getComponent('Particle');
            const velocity = particle.getComponent('Velocity');
            const sprite = particle.getComponent('Sprite');
            
            // Update lifetime
            particleComponent.lifetime -= deltaTime;
            
            // Update trail
            if (particleComponent.trail.length >= particleComponent.trailLength) {
                particleComponent.trail.shift();
            }
            particleComponent.trail.push({ x: transform.x, y: transform.y });
            
            // Fade out
            if (particleComponent.fadeOut) {
                const lifeRatio = particleComponent.lifetime / particleComponent.maxLifetime;
                if (sprite) {
                    sprite.opacity = lifeRatio;
                }
            }
            
            // Remove expired particles
            if (particleComponent.lifetime <= 0) {
                particle.destroy = true;
            }
        }
    }
}

class EffectsSystem extends System {
    constructor(game) {
        super(game);
        this.effectQueue = [];
    }
    
    createJumpEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            
            const particle = new Entity()
                .addComponent(new Transform(x, y, 4, 4))
                .addComponent(new Velocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - 100
                ))
                .addComponent(new Physics())
                .addComponent(new Particle(0.8, true))
                .addComponent(new Sprite('particles', 'sparkle', 5))
                .addTag('effect');
            
            this.game.entityManager.addEntity(particle);
        }
    }
    
    createLandingEffect(x, y) {
        // Dust cloud
        for (let i = 0; i < 12; i++) {
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = Math.random() * 10;
            
            const particle = new Entity()
                .addComponent(new Transform(x + offsetX, y - offsetY, 6, 6))
                .addComponent(new Velocity(
                    (Math.random() - 0.5) * 100,
                    -Math.random() * 50
                ))
                .addComponent(new Physics())
                .addComponent(new Particle(1.2, true))
                .addComponent(new Sprite('particles', 'smoke', 5))
                .addTag('effect');
            
            this.game.entityManager.addEntity(particle);
        }
    }
    
    createSprayEffect(x, y) {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'];
        
        for (let i = 0; i < 5; i++) {
            const angle = (Math.random() - 0.5) * Math.PI * 0.5;
            const speed = 80 + Math.random() * 40;
            
            const particle = new Entity()
                .addComponent(new Transform(x, y, 3, 3))
                .addComponent(new Velocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ))
                .addComponent(new Physics())
                .addComponent(new Particle(1.5, true))
                .addComponent(new Sprite('particles', 'spray_particle', 5))
                .addTag('effect');
            
            const sprite = particle.getComponent('Sprite');
            sprite.tint = colors[Math.floor(Math.random() * colors.length)];
            
            this.game.entityManager.addEntity(particle);
        }
    }
    
    createCrashEffect(x, y) {
        // Explosion particles
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            
            const particle = new Entity()
                .addComponent(new Transform(x, y, 5, 5))
                .addComponent(new Velocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - Math.random() * 50
                ))
                .addComponent(new Physics())
                .addComponent(new Particle(1.0, true))
                .addComponent(new Sprite('particles', 'explosion_particle', 5))
                .addTag('effect');
            
            this.game.entityManager.addEntity(particle);
        }
    }
    
    createCollectEffect(x, y, type) {
        const color = type === 'spray_can' ? '#4ecdc4' : '#ffe66d';
        
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const speed = 60 + Math.random() * 40;
            
            const particle = new Entity()
                .addComponent(new Transform(x, y, 4, 4))
                .addComponent(new Velocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - 50
                ))
                .addComponent(new Physics())
                .addComponent(new Particle(0.8, true))
                .addComponent(new Sprite('particles', 'sparkle', 5))
                .addTag('effect');
            
            particle.getComponent('Sprite').tint = color;
            this.game.entityManager.addEntity(particle);
        }
    }
}

// Achievement System
class AchievementSystem extends System {
    constructor(game) {
        super(game);
        this.achievements = this.initAchievements();
        this.unlockedAchievements = new Set();
        this.loadProgress();
    }
    
    initAchievements() {
        return {
            first_jump: {
                name: 'קפיצה ראשונה',
                description: 'בצע קפיצה ראשונה',
                icon: '🚴',
                unlocked: false
            },
            first_wall: {
                name: 'אמן רחוב',
                description: 'צבע את הקיר הראשון',
                icon: '🎨',
                unlocked: false
            },
            speed_demon: {
                name: 'שד המהירות',
                description: 'עבור 1000 מטר בריצה אחת',
                icon: '💨',
                unlocked: false
            },
            artist: {
                name: 'אמן מקצועי',
                description: 'צבע 10 קירות',
                icon: '🏆',
                unlocked: false
            },
            survivor: {
                name: 'שורד',
                description: 'שחק 5 דקות בלי לאבד חיים',
                icon: '❤️',
                unlocked: false
            },
            collector: {
                name: 'אספן',
                description: 'אסוף 100 מטבעות',
                icon: '🪙',
                unlocked: false
            },
            rebel: {
                name: 'מורד אמיתי',
                description: 'הגע לניקוד של 5000',
                icon: '✊',
                unlocked: false
            },
            perfectionist: {
                name: 'פרפקציוניסט',
                description: 'צבע קיר מלא במהלך קפיצה אחת',
                icon: '⭐',
                unlocked: false
            }
        };
    }
    
    checkAchievement(achievementId, condition) {
        if (condition && !this.achievements[achievementId]?.unlocked) {
            this.unlockAchievement(achievementId);
        }
    }
    
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        this.unlockedAchievements.add(achievementId);
        
        // Show notification
        this.showAchievementNotification(achievement);
        
        // Save progress
        this.saveProgress();
        
        Assets.playSound('achievement');
    }
    
    showAchievementNotification(achievement) {
        const notification = document.getElementById('achievementNotification');
        const desc = document.getElementById('achievementDesc');
        
        if (notification && desc) {
            desc.textContent = `${achievement.icon} ${achievement.name}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }
    
    saveProgress() {
        const progress = {};
        for (const [id, achievement] of Object.entries(this.achievements)) {
            progress[id] = achievement.unlocked;
        }
        localStorage.setItem('chromaticRush_achievements', JSON.stringify(progress));
    }
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('chromaticRush_achievements');
            if (saved) {
                const progress = JSON.parse(saved);
                for (const [id, unlocked] of Object.entries(progress)) {
                    if (this.achievements[id]) {
                        this.achievements[id].unlocked = unlocked;
                        if (unlocked) {
                            this.unlockedAchievements.add(id);
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load achievement progress:', e);
        }
    }
}

// Entity Manager
class EntityManager {
    constructor() {
        this.entities = new Map();
        this.entitiesByTag = new Map();
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
    }
    
    addEntity(entity) {
        this.entitiesToAdd.push(entity);
        return entity;
    }
    
    removeEntity(entity) {
        this.entitiesToRemove.push(entity);
    }
    
    getEntity(id) {
        return this.entities.get(id);
    }
    
    getEntitiesWith(...componentClasses) {
        const result = [];
        
        for (const entity of this.entities.values()) {
            if (!entity.active || entity.destroy) continue;
            
            const hasAllComponents = componentClasses.every(componentClass => 
                entity.hasComponent(componentClass)
            );
            
            if (hasAllComponents) {
                result.push(entity);
            }
        }
        
        return result;
    }
    
    getEntitiesByTag(tag) {
        return this.entitiesByTag.get(tag) || [];
    }
    
    update() {
        // Add new entities
        for (const entity of this.entitiesToAdd) {
            this.entities.set(entity.id, entity);
            
            // Update tag indices
            for (const tag of entity.tags) {
                if (!this.entitiesByTag.has(tag)) {
                    this.entitiesByTag.set(tag, []);
                }
                this.entitiesByTag.get(tag).push(entity);
            }
        }
        this.entitiesToAdd = [];
        
        // Remove entities marked for destruction
        for (const [id, entity] of this.entities) {
            if (entity.destroy) {
                this.entitiesToRemove.push(entity);
            }
        }
        
        // Remove entities
        for (const entity of this.entitiesToRemove) {
            this.entities.delete(entity.id);
            
            // Update tag indices
            for (const tag of entity.tags) {
                const taggedEntities = this.entitiesByTag.get(tag);
                if (taggedEntities) {
                    const index = taggedEntities.indexOf(entity);
                    if (index > -1) {
                        taggedEntities.splice(index, 1);
                    }
                }
            }
        }
        this.entitiesToRemove = [];
    }
    
    clear() {
        this.entities.clear();
        this.entitiesByTag.clear();
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
    }
    
    getEntityCount() {
        return this.entities.size;
    }
}

// Renderer System
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = { x: 0, y: 0 };
        this.shakeAmount = 0;
        this.shakeDecay = 0.9;
        this.layers = new Map();
        
        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Initialize layers
        for (let i = 0; i <= 10; i++) {
            this.layers.set(i, []);
        }
    }
    
    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas size to fit container
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Maintain aspect ratio
        const targetRatio = 4/3;
        const currentRatio = this.canvas.width / this.canvas.height;
        
        if (currentRatio > targetRatio) {
            this.renderWidth = this.canvas.height * targetRatio;
            this.renderHeight = this.canvas.height;
            this.offsetX = (this.canvas.width - this.renderWidth) / 2;
            this.offsetY = 0;
        } else {
            this.renderWidth = this.canvas.width;
            this.renderHeight = this.canvas.width / targetRatio;
            this.offsetX = 0;
            this.offsetY = (this.canvas.height - this.renderHeight) / 2;
        }
        
        // Scale factor for responsive rendering
        this.scale = Math.min(this.canvas.width / 800, this.canvas.height / 600);
    }
    
    addShake(amount) {
        this.shakeAmount = Math.max(this.shakeAmount, amount);
    }
    
    render(entities, deltaTime) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera shake
        if (this.shakeAmount > 0) {
            this.shakeAmount *= this.shakeDecay;
            if (this.shakeAmount < 0.1) this.shakeAmount = 0;
        }
        
        const shakeX = (Math.random() - 0.5) * this.shakeAmount;
        const shakeY = (Math.random() - 0.5) * this.shakeAmount;
        
        this.ctx.save();
        this.ctx.translate(this.offsetX + shakeX, this.offsetY + shakeY);
        this.ctx.scale(this.scale, this.scale);
        
        // Draw background
        this.drawBackground();
        
        // Clear layers
        for (const layer of this.layers.values()) {
            layer.length = 0;
        }
        
        // Sort entities by layer
        const renderableEntities = entities.filter(entity => 
            entity.hasComponent('Transform') && 
            entity.hasComponent('Sprite') && 
            !entity.destroy &&
            entity.active
        );
        
        for (const entity of renderableEntities) {
            const sprite = entity.getComponent('Sprite');
            const layer = Math.max(0, Math.min(10, sprite.layer));
            this.layers.get(layer).push(entity);
        }
        
        // Render layers
        for (let i = 0; i <= 10; i++) {
            const layerEntities = this.layers.get(i);
            for (const entity of layerEntities) {
                this.renderEntity(entity);
            }
        }
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#90EE90');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 800, 600);
        
        // City silhouette
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 10; i++) {
            const height = 100 + Math.random() * 200;
            this.ctx.fillRect(i * 80, 300 - height, 80, height);
        }
        
        // Street
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(0, 450, 800, 150);
        
        // Street markings
        this.ctx.fillStyle = '#fff';
        const cameraOffset = this.camera.x % 90;
        for (let i = -1; i < 12; i++) {
            this.ctx.fillRect(i * 90 - cameraOffset, 520, 60, 8);
        }
    }
    
    renderEntity(entity) {
        const transform = entity.getComponent('Transform');
        const sprite = entity.getComponent('Sprite');
        
        if (!sprite.visible || sprite.opacity <= 0) return;
        
        const spriteImage = Assets.getSprite(sprite.type, sprite.frame);
        if (!spriteImage) return;
        
        this.ctx.save();
        
        // Apply camera transform
        const renderX = transform.x - this.camera.x;
        const renderY = transform.y;
        
        // Apply entity transforms
        this.ctx.translate(renderX + transform.width/2, renderY + transform.height/2);
        this.ctx.rotate(transform.rotation);
        this.ctx.scale(transform.scale * (sprite.flipX ? -1 : 1), transform.scale * (sprite.flipY ? -1 : 1));
        
        // Apply opacity
        this.ctx.globalAlpha = sprite.opacity;
        
        // Apply tint
        if (sprite.tint) {
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = sprite.tint;
            this.ctx.fillRect(-transform.width/2, -transform.height/2, transform.width, transform.height);
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        // Draw sprite
        this.ctx.drawImage(
            spriteImage,
            -transform.width/2,
            -transform.height/2,
            transform.width,
            transform.height
        );
        
        this.ctx.restore();
    }
    
    updateCamera(target) {
        if (target) {
            const targetTransform = target.getComponent('Transform');
            if (targetTransform) {
                // Smooth camera following
                const targetX = targetTransform.x - 200;
                this.camera.x += (targetX - this.camera.x) * 0.05;
            }
        }
    }
}

// UI System
class UISystem {
    constructor(game) {
        this.game = game;
        this.elements = {
            score: document.getElementById('scoreDisplay'),
            lives: document.getElementById('livesDisplay'),
            powerFill: document.getElementById('powerFill'),
            pauseScore: document.getElementById('pauseScore'),
            pauseLives: document.getElementById('pauseLives'),
            pauseDistance: document.getElementById('pauseDistance'),
            finalScore: document.getElementById('finalScore'),
            finalDistance: document.getElementById('finalDistance'),
            sprayCount: document.getElementById('sprayCount'),
            achievementMessage: document.getElementById('achievementMessage'),
            highScoreDisplay: document.getElementById('highScoreDisplay')
        };
        
        this.loadHighScore();
    }
    
    updateScore(score) {
        if (this.elements.score) {
            this.elements.score.textContent = score.toLocaleString();
        }
    }
    
    updateLives(lives) {
        if (this.elements.lives) {
            const hearts = this.elements.lives.children;
            for (let i = 0; i < hearts.length; i++) {
                if (i < lives) {
                    hearts[i].textContent = '❤️';
                    hearts[i].classList.remove('lost');
                } else {
                    hearts[i].textContent = '💔';
                    hearts[i].classList.add('lost');
                }
            }
        }
    }
    
    updateSprayPower(ratio) {
        if (this.elements.powerFill) {
            this.elements.powerFill.style.width = `${ratio * 100}%`;
            
            // Change color based on power level
            if (ratio > 0.6) {
                this.elements.powerFill.style.background = 'var(--rainbow-gradient)';
            } else if (ratio > 0.3) {
                this.elements.powerFill.style.background = 'var(--warning)';
            } else {
                this.elements.powerFill.style.background = 'var(--danger)';
            }
        }
    }
    
    updatePauseStats(score, lives, distance) {
        if (this.elements.pauseScore) this.elements.pauseScore.textContent = score.toLocaleString();
        if (this.elements.pauseLives) this.elements.pauseLives.textContent = lives;
        if (this.elements.pauseDistance) this.elements.pauseDistance.textContent = Math.round(distance);
    }
    
    updateGameOverStats(score, distance, sprayCount) {
        if (this.elements.finalScore) this.elements.finalScore.textContent = score.toLocaleString();
        if (this.elements.finalDistance) this.elements.finalDistance.textContent = Math.round(distance);
        if (this.elements.sprayCount) this.elements.sprayCount.textContent = sprayCount;
        
        // Check for high score
        const isHighScore = this.updateHighScore(score);
        if (isHighScore && this.elements.achievementMessage) {
            this.elements.achievementMessage.textContent = '🏆 שיא חדש! 🏆';
            this.elements.achievementMessage.style.color = 'var(--accent-color)';
        }
    }
    
    updateHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem('chromaticRush_highScore', score.toString());
            if (this.elements.highScoreDisplay) {
                this.elements.highScoreDisplay.textContent = score.toLocaleString();
            }
            return true;
        }
        return false;
    }
    
    getHighScore() {
        try {
            return parseInt(localStorage.getItem('chromaticRush_highScore') || '0');
        } catch {
            return 0;
        }
    }
    
    loadHighScore() {
        const highScore = this.getHighScore();
        if (this.elements.highScoreDisplay) {
            this.elements.highScoreDisplay.textContent = highScore.toLocaleString();
        }
    }
}

// Input Manager
class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = new Set();
        this.touches = new Map();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            
            // Prevent default for game keys
            if (['Space', 'KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
        
        // Mobile touch controls
        this.setupMobileControls();
        
        // Prevent context menu on mobile
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    setupMobileControls() {
        const jumpBtn = document.getElementById('jumpBtn');
        const duckBtn = document.getElementById('duckBtn');
        const sprayBtn = document.getElementById('sprayBtn');
        
        if (jumpBtn) {
            this.setupTouchButton(jumpBtn, 'jump');
        }
        if (duckBtn) {
            this.setupTouchButton(duckBtn, 'duck');
        }
        if (sprayBtn) {
            this.setupTouchButton(sprayBtn, 'spray');
        }
    }
    
    setupTouchButton(button, action) {
        const startTouch = (e) => {
            e.preventDefault();
            button.classList.add('active');
            this.keys.add(`mobile_${action}`);
        };
        
        const endTouch = (e) => {
            e.preventDefault();
            button.classList.remove('active');
            this.keys.delete(`mobile_${action}`);
        };
        
        button.addEventListener('touchstart', startTouch, { passive: false });
        button.addEventListener('touchend', endTouch, { passive: false });
        button.addEventListener('touchcancel', endTouch, { passive: false });
        
        // Also support mouse for testing
        button.addEventListener('mousedown', startTouch);
        button.addEventListener('mouseup', endTouch);
        button.addEventListener('mouseleave', endTouch);
    }
    
    isPressed(key) {
        return this.keys.has(key);
    }
    
    isJumpPressed() {
        return this.isPressed('Space') || this.isPressed('KeyW') || 
               this.isPressed('ArrowUp') || this.isPressed('mobile_jump');
    }
    
    isDuckPressed() {
        return this.isPressed('KeyS') || this.isPressed('ArrowDown') || 
               this.isPressed('mobile_duck');
    }
    
    isSprayPressed() {
        return this.isPressed('KeyX') || this.isPressed('mobile_spray');
    }
}

// Main Game Class
class ChromaticRush {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.entityManager = new EntityManager();
        this.inputManager = new InputManager(this);
        this.ui = new UISystem(this);
        
        // Game systems
        this.systems = [
            new PhysicsSystem(this),
            new CollisionSystem(this),
            new AnimationSystem(this),
            new PlayerSystem(this),
            new AISystem(this),
            new ParticleSystem(this)
        ];
        
        this.effectsSystem = new EffectsSystem(this);
        this.achievementsSystem = new AchievementSystem(this);
        this.systems.push(this.effectsSystem, this.achievementsSystem);
        
        // Game state
        this.gameState = 'loading';
        this.score = 0;
        this.lives = 3;
        this.distance = 0;
        this.gameTime = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.paused = false;
        this.player = null;
        this.gameSpeed = 1;
        this.spawnTimer = 0;
        
        // Game statistics
        this.stats = {
            wallsPainted: 0,
            coinsCollected: 0,
            jumpCount: 0,
            survivalTime: 0
        };
        
        // Level generation
        this.worldGenerator = new WorldGenerator(this);
        
        this.init();
    }
    
    async init() {
        console.log('Initializing Chromatic Rush...');
        
        // Setup UI event listeners
        this.setupUIEvents();
        
        // Load assets
        await Assets.loadAssets();
        
        // Hide loading screen and show main menu
        this.showScreen('mainMenu');
        
        console.log('Game initialized successfully!');
    }
    
    setupUIEvents() {
        // Main menu buttons
        document.getElementById('startBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('instructionsBtn')?.addEventListener('click', () => this.showScreen('instructionsScreen'));
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showScreen('settingsScreen'));
        
        // Back buttons
        document.getElementById('backFromInstructions')?.addEventListener('click', () => this.showScreen('mainMenu'));
        document.getElementById('backFromSettings')?.addEventListener('click', () => this.showScreen('settingsScreen'));
        
        // Game controls
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuBtn')?.addEventListener('click', () => this.returnToMenu());
        
        // Game over buttons
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('backToMenuBtn')?.addEventListener('click', () => this.returnToMenu());
        
        // Settings controls
        this.setupSettingsControls();
    }
    
    setupSettingsControls() {
        const musicVolume = document.getElementById('musicVolume');
        const sfxVolume = document.getElementById('sfxVolume');
        const musicVolumeValue = document.getElementById('musicVolumeValue');
        const sfxVolumeValue = document.getElementById('sfxVolumeValue');
        
        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                Assets.setVolume('music', value);
                if (musicVolumeValue) musicVolumeValue.textContent = `${value}%`;
            });
        }
        
        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                Assets.setVolume('sfx', value);
                if (sfxVolumeValue) sfxVolumeValue.textContent = `${value}%`;
            });
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
    
    startGame() {
        console.log('Starting new game...');
        
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.distance = 0;
        this.gameTime = 0;
        this.gameSpeed = 1;
        this.paused = false;
        
        // Reset stats
        this.stats = {
            wallsPainted: 0,
            coinsCollected: 0,
            jumpCount: 0,
            survivalTime: 0
        };
        
        // Clear entities
        this.entityManager.clear();
        
        // Create player
        this.createPlayer();
        
        // Generate initial world
        this.worldGenerator.generateInitialWorld();
        
        // Update UI
        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
        this.ui.updateSprayPower(1.0);
        
        // Show game screen
        this.showScreen('gameScreen');
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    createPlayer() {
        this.player = new Entity()
            .addComponent(new Transform(100, 350, 32, 32))
            .addComponent(new Velocity(0, 0))
            .addComponent(new Physics())
            .addComponent(new Sprite('player', 'idle', 2))
            .addComponent(new Animation([], 0.2, true))
            .addComponent(new Health(3))
            .addComponent(new PlayerController())
            .addComponent(new Collider(28, 32, 2, 0))
            .addTag('player');
        
        this.entityManager.addEntity(this.player);
    }
    
    pauseGame() {
        if (this.gameState === 'playing' && !this.paused) {
            this.paused = true;
            this.ui.updatePauseStats(this.score, this.lives, this.distance);
            this.showScreen('pauseScreen');
        }
    }
    
    resumeGame() {
        if (this.paused) {
            this.paused = false;
            this.showScreen('gameScreen');
            this.lastTime = performance.now(); // Reset timer to prevent frame skip
        }
    }
    
    restartGame() {
        this.startGame();
    }
    
    returnToMenu() {
        this.gameState = 'menu';
        this.paused = false;
        this.showScreen('mainMenu');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update final stats
        this.ui.updateGameOverStats(this.score, this.distance, this.stats.wallsPainted);
        
        // Show game over screen
        this.showScreen('gameOverScreen');
        
        // Check achievements
        this.achievementsSystem.checkAchievement('collector', this.stats.coinsCollected >= 100);
        this.achievementsSystem.checkAchievement('rebel', this.score >= 5000);
        this.achievementsSystem.checkAchievement('speed_demon', this.distance >= 1000);
    }
    
    addScore(points) {
        this.score += Math.floor(points * this.gameSpeed);
        this.ui.updateScore(this.score);
    }
    
    gameLoop(currentTime = performance.now()) {
        if (this.gameState !== 'playing' || this.paused) {
            if (this.gameState === 'playing') {
                requestAnimationFrame((time) => this.gameLoop(time));
            }
            return;
        }
        
        // Calculate delta time
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;
        
        // Update game stats
        this.distance += 100 * this.deltaTime * this.gameSpeed;
        this.stats.survivalTime = this.gameTime;
        
        // Gradually increase game speed
        this.gameSpeed = Math.min(2.0, 1 + this.gameTime * 0.01);
        
        // Process player input
        this.handleInput();
        
        // Update entity manager
        this.entityManager.update();
        
        // Run systems
        const entities = Array.from(this.entityManager.entities.values());
        for (const system of this.systems) {
            if (system.enabled) {
                system.update(this.deltaTime, entities);
            }
        }
        
        // Generate world content
        this.worldGenerator.update(this.deltaTime);
        
        // Update camera
        this.renderer.updateCamera(this.player);
        
        // Render frame
        this.renderer.render(entities, this.deltaTime);
        
        // Continue game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    handleInput() {
        if (!this.player) return;
        
        const controller = this.player.getComponent('PlayerController');
        if (!controller) return;
        
        // Reset actions
        controller.actions.jump = false;
        controller.actions.duck = false;
        controller.actions.spray = false;
        
        // Check input
        if (this.inputManager.isJumpPressed()) {
            controller.actions.jump = true;
            this.stats.jumpCount++;
            this.achievementsSystem.checkAchievement('first_jump', this.stats.jumpCount >= 1);
        }
        
        if (this.inputManager.isDuckPressed()) {
            controller.actions.duck = true;
        }
        
        if (this.inputManager.isSprayPressed()) {
            controller.actions.spray = true;
        }
        
        // Pause check
        if (this.inputManager.isPressed('Escape') || this.inputManager.isPressed('KeyP')) {
            this.pauseGame();
        }
    }
}

// World Generator
class WorldGenerator {
    constructor(game) {
        this.game = game;
        this.lastSpawnX = 0;
        this.spawnDistance = 150;
        this.patterns = this.initPatterns();
        this.patternIndex = 0;
        this.buildingSpawnX = 0;
        this.buildingDistance = 200;
    }
    
    initPatterns() {
        return [
            // Simple obstacles
            { type: 'single_barrier', weight: 30, minDistance: 0 },
            { type: 'double_cone', weight: 25, minDistance: 200 },
            { type: 'pothole_series', weight: 20, minDistance: 400 },
            { type: 'corporate_ambush', weight: 15, minDistance: 600 },
            { type: 'drone_patrol', weight: 10, minDistance: 800 }
        ];
    }
    
    generateInitialWorld() {
        // Generate initial background buildings
        for (let x = 0; x < 2000; x += this.buildingDistance) {
            this.spawnBuilding(x);
        }
        
        // Generate initial obstacles and collectibles
        this.lastSpawnX = 400; // Start spawning after player has some time
        for (let i = 0; i < 10; i++) {
            this.spawnPattern();
        }
    }
    
    update(deltaTime) {
        const playerTransform = this.game.player?.getComponent('Transform');
        if (!playerTransform) return;
        
        const spawnThreshold = playerTransform.x + 800;
        
        // Spawn new content as player progresses
        while (this.lastSpawnX < spawnThreshold) {
            this.spawnPattern();
        }
        
        // Spawn buildings
        while (this.buildingSpawnX < spawnThreshold + 400) {
            this.spawnBuilding(this.buildingSpawnX);
            this.buildingSpawnX += this.buildingDistance + Math.random() * 100;
        }
        
        // Remove entities that are far behind the player
        const cleanupThreshold = playerTransform.x - 400;
        const entities = Array.from(this.game.entityManager.entities.values());
        for (const entity of entities) {
            if (entity.hasTag('obstacle') || entity.hasTag('collectible') || entity.hasTag('building')) {
                const transform = entity.getComponent('Transform');
                if (transform && transform.x < cleanupThreshold) {
                    entity.destroy = true;
                }
            }
        }
    }
    
    spawnPattern() {
        const availablePatterns = this.patterns.filter(p => this.game.distance >= p.minDistance);
        if (availablePatterns.length === 0) return;
        
        // Weighted random selection
        const totalWeight = availablePatterns.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedPattern = availablePatterns[0];
        
        for (const pattern of availablePatterns) {
            random -= pattern.weight;
            if (random <= 0) {
                selectedPattern = pattern;
                break;
            }
        }
        
        this.executePattern(selectedPattern.type);
        this.lastSpawnX += this.spawnDistance + Math.random() * 100;
    }
    
    executePattern(patternType) {
        const x = this.lastSpawnX;
        
        switch (patternType) {
            case 'single_barrier':
                this.spawnObstacle(x, 'barrier');
                this.spawnCollectible(x + 50, 'coin');
                break;
                
            case 'double_cone':
                this.spawnObstacle(x, 'cone');
                this.spawnObstacle(x + 80, 'cone');
                this.spawnCollectible(x + 40, 'spray_can');
                break;
                
            case 'pothole_series':
                for (let i = 0; i < 3; i++) {
                    this.spawnObstacle(x + i * 60, 'pothole');
                }
                this.spawnCollectible(x + 180, 'power_up');
                break;
                
            case 'corporate_ambush':
                this.spawnObstacle(x, 'corporate_van');
                this.spawnObstacle(x + 100, 'security_drone');
                this.spawnCollectible(x - 30, 'spray_can');
                this.spawnCollectible(x + 150, 'spray_can');
                break;
                
            case 'drone_patrol':
                for (let i = 0; i < 2; i++) {
                    this.spawnMovingObstacle(x + i * 120, 'security_drone', 'patrol');
                }
                this.spawnCollectible(x + 60, 'coin');
                this.spawnCollectible(x + 180, 'coin');
                break;
        }
    }
    
    spawnObstacle(x, type) {
        const obstacle = new Entity()
            .addComponent(new Transform(x, 380, 64, 64))
            .addComponent(new Sprite('obstacles', type, 1))
            .addComponent(new Collider(60, 60, 2, 2))
            .addComponent(new Obstacle(type, 1))
            .addTag('obstacle');
        
        this.game.entityManager.addEntity(obstacle);
    }
    
    spawnMovingObstacle(x, type, aiType) {
        const obstacle = new Entity()
            .addComponent(new Transform(x, 200, 64, 64))
            .addComponent(new Velocity(0, 0))
            .addComponent(new Physics())
            .addComponent(new Sprite('obstacles', type, 1))
            .addComponent(new Collider(60, 60, 2, 2))
            .addComponent(new Obstacle(type, 1))
            .addComponent(new AIController(aiType, { speed: 80, range: 150, startX: x }))
            .addTag('obstacle')
            .addTag('ai');
        
        this.game.entityManager.addEntity(obstacle);
    }
    
    spawnCollectible(x, type) {
        const groundY = 400;
        const y = type === 'power_up' ? groundY - 80 : groundY - 20;
        
        const collectible = new Entity()
            .addComponent(new Transform(x, y, 32, 32))
            .addComponent(new Sprite('collectibles', type, 1))
            .addComponent(new Collider(28, 28, 2, 2))
            .addComponent(new Collectible(type, this.getCollectibleValue(type)))
            .addTag('collectible');
        
        // Add floating animation for power-ups
        if (type === 'power_up') {
            collectible.addComponent(new Animation(['power_up'], 0.1, true));
        }
        
        this.game.entityManager.addEntity(collectible);
    }
    
    spawnBuilding(x) {
        const buildingTypes = ['building1', 'building2', 'building3'];
        const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
        const height = 200 + Math.random() * 200;
        
        const building = new Entity()
            .addComponent(new Transform(x, 300 - height, 120, height))
            .addComponent(new Sprite('background', type, 0))
            .addTag('building');
        
        // Some buildings can be painted (street art targets)
        if (Math.random() < 0.3) {
            building
                .addComponent(new StreetArt())
                .addComponent(new Collider(115, height - 50, 2, 25))
                .addTag('streetart');
        }
        
        this.game.entityManager.addEntity(building);
    }
    
    getCollectibleValue(type) {
        switch (type) {
            case 'coin': return 10;
            case 'spray_can': return 25;
            case 'power_up': return 50;
            default: return 10;
        }
    }
}

// Global game instance
window.ChromaticRush = {
    instance: null,
    
    init() {
        this.instance = new ChromaticRush();
        return this.instance;
    }
};