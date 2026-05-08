from importlib import import_module


def test_app_factory_is_importable() -> None:
    module = import_module("app.main")
    app = module.create_app()

    assert app is not None
    assert app.title == "ExamStack API"
