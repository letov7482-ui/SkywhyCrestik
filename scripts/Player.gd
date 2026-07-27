extends CharacterBody3D

const SPEED = 4.0
var gravity = ProjectSettings.get_setting("physics/3d/default_gravity")

@export var sensitivity: float = 0.25
var joystick_vector = Vector2.ZERO # Данные с экранного джойстика Android

@onready var head = $Head
@onready var camera = $Head/Camera3D
@onready var flashlight = $Head/Camera3D/SpotLight3D

var flashlight_battery: float = 100.0
var is_flashlight_on: bool = true
var is_moving: bool = false
var t_bob = 0.0

func _unhandled_input(event: InputEvent) -> void:
	# Считывание движений пальца по экрану Redmi Note 12 для вращения головой
	if event is InputEventScreenDrag:
		rotate_y(deg_to_rad(-event.relative.x * sensitivity))
		head.rotate_x(deg_to_rad(-event.relative.y * sensitivity))
		# Ограничиваем обзор, чтобы шея персонажа не выкручивалась назад
		head.rotation.x = clamp(head.rotation.x, deg_to_rad(-85), deg_to_rad(85))

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Переводим вектор тач-джойстика в 3D направление ходьбы
	var input_dir = joystick_vector
	var direction = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
	
	if direction:
		velocity.x = direction.x * SPEED
		velocity.z = direction.z * SPEED
		is_moving = true
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)
		velocity.z = move_toward(velocity.z, 0, SPEED)
		is_moving = false

	# Современное плавное покачивание камеры (Head Bobbing), как в Outlast
	if is_moving and is_on_floor():
		t_bob += delta * velocity.length() * 4.0
		camera.transform.origin = Vector3(cos(t_bob / 2) * 0.05, sin(t_bob) * 0.05, 0)
	else:
		t_bob = 0.0
		camera.transform.origin = camera.transform.origin.lerp(Vector3.ZERO, delta * 10.0)

	# Разрядка аккумулятора фонарика
	if is_flashlight_on and flashlight_battery > 0:
		flashlight_battery -= delta * 0.5
		if flashlight_battery < 20.0 and randf() < 0.04:
			flashlight.visible = false # Мерцание при низком заряде батареи
		else:
			flashlight.visible = true
