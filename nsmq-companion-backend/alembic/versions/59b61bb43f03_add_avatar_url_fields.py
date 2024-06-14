"""Add avatar_url fields

Revision ID: 59b61bb43f03
Revises: f0bfb4f6b60f
Create Date: 2024-06-08 22:03:00.298320

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '59b61bb43f03'
down_revision: Union[str, None] = 'f0bfb4f6b60f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('quiz_session',
    sa.Column('uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('player1_uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('player2_uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['player1_uuid'], ['students.uuid'], name='quiz_session_player1_uuid_fkey'),
    sa.ForeignKeyConstraint(['player2_uuid'], ['students.uuid'], name='quiz_session_player2_uuid_fkey'),
    sa.PrimaryKeyConstraint('id', 'uuid', name='quiz_session_pkey'),
    sa.UniqueConstraint('uuid', name='quiz_session_uuid_key')
    )
    op.create_index('ix_quiz_session_id', 'quiz_session', ['id'], unique=False)
    op.create_table('students',
    sa.Column('uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('first_name', sa.VARCHAR(length=30), autoincrement=False, nullable=False),
    sa.Column('last_name', sa.VARCHAR(length=30), autoincrement=False, nullable=False),
    sa.Column('year', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('email_address', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('password', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('account_type', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('facilitator_uuid', sa.UUID(), autoincrement=False, nullable=True),
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('students_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['facilitator_uuid'], ['Facilitators.uuid'], name='students_facilitator_uuid_fkey'),
    sa.PrimaryKeyConstraint('id', 'uuid', name='students_pkey'),
    sa.UniqueConstraint('email_address', name='students_email_address_key'),
    sa.UniqueConstraint('uuid', name='students_uuid_key'),
    postgresql_ignore_search_path=False
    )
    op.create_index('ix_students_id', 'students', ['id'], unique=False)
    op.create_table('email_verifications',
    sa.Column('uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('facilitator_uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('verification_token', sa.VARCHAR(length=450), autoincrement=False, nullable=True),
    sa.Column('expiry_date', sa.VARCHAR(length=450), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['facilitator_uuid'], ['Facilitators.uuid'], name='email_verifications_facilitator_uuid_fkey'),
    sa.PrimaryKeyConstraint('uuid', 'facilitator_uuid', name='email_verifications_pkey'),
    sa.UniqueConstraint('facilitator_uuid', name='email_verifications_facilitator_uuid_key'),
    sa.UniqueConstraint('uuid', name='email_verifications_uuid_key')
    )
    op.create_table('websockets',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('player_uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('connected_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['player_uuid'], ['students.uuid'], name='websockets_player_uuid_fkey'),
    sa.PrimaryKeyConstraint('id', name='websockets_pkey')
    )
    op.create_table('Facilitators',
    sa.Column('uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('first_name', sa.VARCHAR(length=30), autoincrement=False, nullable=False),
    sa.Column('last_name', sa.VARCHAR(length=30), autoincrement=False, nullable=False),
    sa.Column('school', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('email_address', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('password', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('verifiedAt', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('account_type', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('id', sa.INTEGER(), server_default=sa.text('nextval(\'"Facilitators_id_seq"\'::regclass)'), autoincrement=True, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', 'uuid', name='Facilitators_pkey'),
    sa.UniqueConstraint('uuid', name='Facilitators_uuid_key'),
    postgresql_ignore_search_path=False
    )
    op.create_index('ix_Facilitators_verifiedAt', 'Facilitators', ['verifiedAt'], unique=False)
    op.create_index('ix_Facilitators_school', 'Facilitators', ['school'], unique=False)
    op.create_index('ix_Facilitators_last_name', 'Facilitators', ['last_name'], unique=False)
    op.create_index('ix_Facilitators_id', 'Facilitators', ['id'], unique=False)
    op.create_index('ix_Facilitators_first_name', 'Facilitators', ['first_name'], unique=False)
    op.create_index('ix_Facilitators_email_address', 'Facilitators', ['email_address'], unique=False)
    op.create_index('ix_Facilitators_account_type', 'Facilitators', ['account_type'], unique=False)
    op.create_table('token',
    sa.Column('uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('user_uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('access_toke', sa.VARCHAR(length=450), autoincrement=False, nullable=False),
    sa.Column('refresh_toke', sa.VARCHAR(length=450), autoincrement=False, nullable=False),
    sa.Column('status', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('created_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('uuid', 'access_toke', name='token_pkey'),
    sa.UniqueConstraint('uuid', name='token_uuid_key')
    )
    op.create_table('facilitators',
    sa.Column('uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('first_name', sa.VARCHAR(length=30), autoincrement=False, nullable=False),
    sa.Column('last_name', sa.VARCHAR(length=30), autoincrement=False, nullable=False),
    sa.Column('school', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('email_address', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('password', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('verifiedAt', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('account_type', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', 'uuid', name='facilitators_pkey'),
    sa.UniqueConstraint('uuid', name='facilitators_uuid_key')
    )
    op.create_index('ix_facilitators_verifiedAt', 'facilitators', ['verifiedAt'], unique=False)
    op.create_index('ix_facilitators_school', 'facilitators', ['school'], unique=False)
    op.create_index('ix_facilitators_last_name', 'facilitators', ['last_name'], unique=False)
    op.create_index('ix_facilitators_id', 'facilitators', ['id'], unique=False)
    op.create_index('ix_facilitators_first_name', 'facilitators', ['first_name'], unique=False)
    op.create_index('ix_facilitators_email_address', 'facilitators', ['email_address'], unique=False)
    op.create_index('ix_facilitators_account_type', 'facilitators', ['account_type'], unique=False)
    op.create_table('waiting_room_data',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('student_uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('joined_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('connected', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('matched', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('opponent_uuid', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['student_uuid'], ['students.uuid'], name='waiting_room_data_student_uuid_fkey'),
    sa.PrimaryKeyConstraint('id', name='waiting_room_data_pkey')
    )

    # ### commands auto generated by Alembic - please adjust! ###
  
    # ### end Alembic commands ###

def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('waiting_room_data')
    op.drop_index('ix_facilitators_account_type', table_name='facilitators')
    op.drop_index('ix_facilitators_email_address', table_name='facilitators')
    op.drop_index('ix_facilitators_first_name', table_name='facilitators')
    op.drop_index('ix_facilitators_id', table_name='facilitators')
    op.drop_index('ix_facilitators_last_name', table_name='facilitators')
    op.drop_index('ix_facilitators_school', table_name='facilitators')
    op.drop_index('ix_facilitators_verifiedAt', table_name='facilitators')
    op.drop_table('facilitators')
    op.drop_table('token')
    op.drop_index('ix_Facilitators_account_type', table_name='Facilitators')
    op.drop_index('ix_Facilitators_email_address', table_name='Facilitators')
    op.drop_index('ix_Facilitators_first_name', table_name='Facilitators')
    op.drop_index('ix_Facilitators_id', table_name='Facilitators')
    op.drop_index('ix_Facilitators_last_name', table_name='Facilitators')
    op.drop_index('ix_Facilitators_school', table_name='Facilitators')
    op.drop_index('ix_Facilitators_verifiedAt', table_name='Facilitators')
    op.drop_table('Facilitators')
    op.drop_table('websockets')
    op.drop_table('email_verifications')
    op.drop_index('ix_students_id', table_name='students')
    op.drop_table('students')
    op.drop_index('ix_quiz_session_id', table_name='quiz_session')
    op.drop_table('quiz_session')
    # ### end Alembic commands ###
