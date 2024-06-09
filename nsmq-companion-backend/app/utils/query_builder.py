from sqlalchemy.sql.expression import and_

SQLALCHEMY_QUERY_MAPPER = {
    "eq": "__eq__",
    "ne": "__ne__",
    "lt": "__lt__",
    "lte": "__le__",
    "gt": "__gt__",
    "gte": "__ge__",
}


def apply_simple_filter(attr, option_from_dict):
    if isinstance(option_from_dict, (int, float)):
        return attr == option_from_dict
    elif isinstance(option_from_dict, str):
        return attr.like("%" + option_from_dict + "%")
    elif isinstance(option_from_dict, bool):
        return attr.is_(option_from_dict)
    return None


def apply_custom_filter(attr, command, option_from_dict):
    if command == "in":
        return attr.in_([option.strip() for option in option_from_dict.split(",")])
    elif command in SQLALCHEMY_QUERY_MAPPER.keys():
        return getattr(attr, SQLALCHEMY_QUERY_MAPPER[command])(option_from_dict)
    elif command == "isnull":
        bool_command = "__eq__" if option_from_dict else "__ne__"
        return getattr(attr, bool_command)(None)
    return None


def dict_to_sqlalchemy_filter_options(model_class, search_option_dict):
    sql_alchemy_filter_options = []
    copied_dict = search_option_dict.copy()

    for key, option_from_dict in copied_dict.items():
        attr = getattr(model_class, key, None)
        if attr is not None:
            simple_filter = apply_simple_filter(attr, option_from_dict)
            if simple_filter is not None:
                sql_alchemy_filter_options.append(simple_filter)

    for custom_option, option_from_dict in copied_dict.items():
        if "__" in custom_option:
            key, command = custom_option.split("__")
            attr = getattr(model_class, key, None)
            if attr is not None:
                custom_filter = apply_custom_filter(attr, command, option_from_dict)
                if custom_filter is not None:
                    sql_alchemy_filter_options.append(custom_filter)

    return and_(True, *sql_alchemy_filter_options)