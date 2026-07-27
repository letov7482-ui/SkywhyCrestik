extends CharacterBody3D

@export var speed_patrol: float = 2.0
@export var speed_hunt: float = 5.5

@onready var nav_agent: NavigationAgent3D = $NavigationAgent3D
@onready var state_timer: Timer = $StateTimer

enum State { PATROL, OBSERVE, HUNT }
var current_state: State = State.PATROL

var player: CharacterBody3D = null
var target_pos: Vector3 = Vector3.ZERO

func _ready() -> void:
	# Ищем игрока по группе сцены
	var players = get_tree().get_nodes_in_group("Player")
	if players.size() > 0:
		player = players[0]
	_choose_new_patrol_point()

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= ProjectSettings.get_setting("physics/3d/default_gravity") * delta

	if player:
		var distance = global_position.distance_to(player.global_position)
		_handle_states(distance)

	# Рассчитываем путь движения в обход стен
	if not nav_agent.is_navigation_finished():
		var next_pos = nav_agent.get_next_path_position()
		var dir = (next_pos - global_position).normalized()
		var target_speed = speed_hunt if current_state == State.HUNT else speed_patrol
		
		velocity.x = dir.x * target_speed
		velocity.z = dir.z * target_speed
		
		# Плавный разворот лица монстра в сторону шагов
		if Vector2(velocity.x, velocity.z).length() > 0.1:
			var look_angle = atan2(-velocity.x, -velocity.z)
			rotation.y = rotate_toward(rotation.y, look_angle, delta * 5.0)
			
	move_and_slide()

func _handle_states(distance: float) -> void:
	match current_state:
		State.PATROL:
			nav_agent.target_position = target_pos
			if distance < 15.0:
				current_state = State.OBSERVE # Заметил игрока, начинает слежку
				
		State.OBSERVE:
			look_at(Vector3(player.global_position.x, global_position.y, player.global_position.z), Vector3.UP)
			if distance < 8.0:
				current_state = State.HUNT # Слишком близко! Включается атака
				
		State.HUNT:
			nav_agent.target_position = player.global_position # Бежит за игроком
			if distance < 1.5:
				_kill_player()

func _choose_new_patrol_point() -> void:
	target_pos = global_position + Vector3(randf_range(-15, 15), 0, randf_range(-15, 15))

func _on_state_timer_timeout() -> void:
	if current_state == State.PATROL:
		_choose_new_patrol_point()

func _kill_player() -> void:
	# Нападение монстра и перезагрузка матча SkyWhy
	get_tree().reload_current_scene()
