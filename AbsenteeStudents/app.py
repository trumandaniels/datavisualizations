import dash
from dash import dcc, html, Input, Output
import plotly.express as px
import pandas as pd
from urllib.request import urlopen
import json

df = pd.read_csv(r"C:\Users\Truman\Documents\datavisualizations\AbsenteeStudents/AbsenteeSpreadsheetClean.csv")
# Create a Dash app
app = dash.Dash(__name__)

# Create the choropleth map

# Define the layout of the app
app.layout = html.Div(children=[
    html.H1("Students With 15 Or More Absentees In A Single Year By State", style={'textAlign': 'center', 'marginBottom': '20px'} ),
    dcc.Dropdown(
        id='data-dropdown',
        options=[
            {'label': 'Total Absentee Students', 'value': 'Total Students'},
            {'label': 'American Indian or Alaska Native', 'value': 'American Indian or Alaska Native'},
            {'label': 'Hispanic or Latino of any race', 'value': 'Hispanic or Latino of any race'},
            {'label': 'Black or African American', 'value': 'Black or African American'},
            {'label': 'Native Hawaiian or Other Pacific Islander', 'value': 'Native Hawaiian or Other Pacific Islander'},
            {'label': 'Students With Disabilities Served Under IDEA', 'value': 'Students With Disabilities Served Under IDEA'},
            {'label': 'Students With Disabilities Served Only Under Section 504', 'value': 'Students With Disabilities Served Only Under Section 504'},
            {'label': 'English Language Learners', 'value': 'English Language Learners'},
            {'label': 'Students Per School', 'value': 'Students Per School'}
        ],
        value='Total Students',  # Default value
        style={'width': '20vw', 'display': 'flex', 'justifyContent': 'flex-end', 'marginBottom': '20px'}
    ),
    dcc.Graph(
        id='us-map',
        style={'width': '95vw', 'height': '80vh', 'fontFamily': 'Newsreader'},
    )
])

# Callback to update the map based on dropdown selection
@app.callback(
    Output('us-map', 'figure'),
    Input('data-dropdown', 'value')
)

def update_map(selected_data):
    fig = px.choropleth(df,
                        locations="State Short", 
                        locationmode="USA-states", 
                        color=selected_data, 
                        color_continuous_scale='redor', 
                        hover_name="State", 
                        labels={selected_data: "Total Students"},
                        scope="usa")
    fig.update_traces(name="Students", selector=dict(type='choropleth'))
    return fig

# Run the server
if __name__ == '__main__':
    app.run_server(debug=True)
